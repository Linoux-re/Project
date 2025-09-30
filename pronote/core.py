"""Core gradebook logic for the ProNote mini application."""
from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Iterable, List, MutableMapping, Optional
import json
import math


@dataclass
class Grade:
    """Represents a single graded item."""

    value: float
    weight: float = 1.0
    comment: Optional[str] = None

    def to_dict(self) -> Dict[str, float | str]:
        """Return a JSON serialisable representation of the grade."""
        data = asdict(self)
        if data["comment"] is None:
            data.pop("comment")
        return data

    @classmethod
    def from_dict(cls, payload: MutableMapping[str, object]) -> "Grade":
        """Re-create a :class:`Grade` from a dictionary."""
        return cls(
            value=float(payload["value"]),
            weight=float(payload.get("weight", 1.0)),
            comment=payload.get("comment"),
        )


class ProNote:
    """A small gradebook manager inspired by the French "ProNote" software."""

    def __init__(self) -> None:
        self._subjects: set[str] = set()
        self._students: Dict[str, Dict[str, List[Grade]]] = {}

    # ------------------------------------------------------------------
    # Student & subject management
    # ------------------------------------------------------------------
    def add_student(self, name: str) -> None:
        """Register a new student in the gradebook."""
        name = name.strip()
        if not name:
            raise ValueError("Student name cannot be empty")
        if name in self._students:
            raise ValueError(f"Student '{name}' already exists")
        self._students[name] = {subject: [] for subject in self._subjects}

    def remove_student(self, name: str) -> None:
        """Remove a student from the gradebook."""
        if name not in self._students:
            raise KeyError(f"Unknown student: {name}")
        del self._students[name]

    def add_subject(self, name: str) -> None:
        """Add a new subject to the gradebook."""
        name = name.strip()
        if not name:
            raise ValueError("Subject name cannot be empty")
        if name in self._subjects:
            raise ValueError(f"Subject '{name}' already exists")
        self._subjects.add(name)
        for student in self._students.values():
            student[name] = []

    def remove_subject(self, name: str) -> None:
        """Remove a subject and all associated grades."""
        if name not in self._subjects:
            raise KeyError(f"Unknown subject: {name}")
        self._subjects.remove(name)
        for student in self._students.values():
            student.pop(name, None)

    # ------------------------------------------------------------------
    # Grade management
    # ------------------------------------------------------------------
    def add_grade(
        self,
        student: str,
        subject: str,
        value: float,
        *,
        weight: float = 1.0,
        comment: Optional[str] = None,
    ) -> None:
        """Attach a grade to a student and subject."""
        record = self._get_subject_grades(student, subject)
        record.append(Grade(value=float(value), weight=float(weight), comment=comment))

    def clear_grades(self, student: str, subject: Optional[str] = None) -> None:
        """Remove all grades for a student."""
        if student not in self._students:
            raise KeyError(f"Unknown student: {student}")
        if subject is None:
            for grades in self._students[student].values():
                grades.clear()
        else:
            self._get_subject_grades(student, subject).clear()

    # ------------------------------------------------------------------
    # Average computations
    # ------------------------------------------------------------------
    def student_average(self, student: str, subject: Optional[str] = None) -> float:
        """Compute the weighted average for a student."""
        if student not in self._students:
            raise KeyError(f"Unknown student: {student}")

        if subject is not None:
            grades = self._get_subject_grades(student, subject)
            return self._average(grades)

        all_grades: List[Grade] = []
        for grades in self._students[student].values():
            all_grades.extend(grades)
        return self._average(all_grades)

    def subject_average(self, subject: str) -> float:
        """Average grade for a subject across all students."""
        if subject not in self._subjects:
            raise KeyError(f"Unknown subject: {subject}")
        all_grades: List[Grade] = []
        for student in self._students.values():
            all_grades.extend(student.get(subject, []))
        return self._average(all_grades)

    def class_average(self) -> float:
        """Overall average for the classroom."""
        all_grades: List[Grade] = []
        for student in self._students.values():
            for grades in student.values():
                all_grades.extend(grades)
        return self._average(all_grades)

    # ------------------------------------------------------------------
    # Reporting utilities
    # ------------------------------------------------------------------
    def student_report(self, student: str) -> str:
        """Return a textual report for a student."""
        if student not in self._students:
            raise KeyError(f"Unknown student: {student}")
        title = f"Report for {student}"
        lines = [title, "=" * len(title)]
        for subject in sorted(self._subjects):
            grades = self._students[student].get(subject, [])
            lines.append("")
            lines.append(subject)
            lines.append("-" * len(subject))
            if not grades:
                lines.append("No grades yet")
                continue
            for grade in grades:
                line = f"- {grade.value:.2f} (weight {grade.weight:g})"
                if grade.comment:
                    line += f" – {grade.comment}"
                lines.append(line)
            avg = self._average(grades)
            if not math.isnan(avg):
                lines.append(f"Subject average: {avg:.2f}")
        overall = self.student_average(student)
        if not math.isnan(overall):
            lines.append("")
            lines.append(f"Overall average: {overall:.2f}")
        return "\n".join(lines)

    # ------------------------------------------------------------------
    # Persistence helpers
    # ------------------------------------------------------------------
    def to_dict(self) -> Dict[str, object]:
        """Serialize the gradebook to a plain dictionary."""
        return {
            "subjects": sorted(self._subjects),
            "students": {
                student: {
                    subject: [grade.to_dict() for grade in grades]
                    for subject, grades in subjects.items()
                }
                for student, subjects in self._students.items()
            },
        }

    @classmethod
    def from_dict(cls, payload: MutableMapping[str, object]) -> "ProNote":
        """Restore a :class:`ProNote` instance from serialized data."""
        instance = cls()
        subjects = payload.get("subjects", [])
        for subject in subjects:
            instance._subjects.add(str(subject))
        students = payload.get("students", {})
        for student_name, subjects_payload in students.items():
            student_name = str(student_name)
            instance._students[student_name] = {}
            for subject in instance._subjects:
                instance._students[student_name][subject] = []
            for subject_name, grades_payload in subjects_payload.items():
                subject_name = str(subject_name)
                if subject_name not in instance._subjects:
                    instance._subjects.add(subject_name)
                    for record in instance._students.values():
                        record.setdefault(subject_name, [])
                grade_list = [
                    Grade.from_dict(grade_payload)  # type: ignore[arg-type]
                    for grade_payload in grades_payload
                ]
                instance._students[student_name][subject_name] = grade_list
        for student_name in list(instance._students):
            for subject in instance._subjects:
                instance._students[student_name].setdefault(subject, [])
        return instance

    def save(self, path: str | Path) -> None:
        """Persist the gradebook to a JSON file."""
        data = self.to_dict()
        Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False))

    @classmethod
    def load(cls, path: str | Path) -> "ProNote":
        """Load gradebook information from a JSON file."""
        content = Path(path).read_text()
        data = json.loads(content)
        return cls.from_dict(data)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _get_subject_grades(self, student: str, subject: str) -> List[Grade]:
        if student not in self._students:
            raise KeyError(f"Unknown student: {student}")
        if subject not in self._subjects:
            raise KeyError(f"Unknown subject: {subject}")
        subjects = self._students[student]
        if subject not in subjects:
            subjects[subject] = []
        return subjects[subject]

    @staticmethod
    def _average(grades: Iterable[Grade]) -> float:
        total = 0.0
        total_weight = 0.0
        for grade in grades:
            total += grade.value * grade.weight
            total_weight += grade.weight
        if total_weight == 0:
            return float("nan")
        return total / total_weight
