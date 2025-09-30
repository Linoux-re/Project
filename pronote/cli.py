"""Command line interface for the ProNote gradebook manager."""
from __future__ import annotations

from pathlib import Path
import argparse
import json
import math
import sys

from .core import ProNote


def load_gradebook(path: Path) -> ProNote:
    if not path.exists():
        return ProNote()
    return ProNote.load(path)


def save_gradebook(path: Path, gradebook: ProNote) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    gradebook.save(path)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage a small ProNote gradebook")
    parser.add_argument(
        "--data",
        type=Path,
        default=Path("pronote.json"),
        help="Path to the JSON file storing the gradebook (default: pronote.json)",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    student_parser = subparsers.add_parser("add-student", help="Register a new student")
    student_parser.add_argument("name", help="Name of the student to add")

    remove_student_parser = subparsers.add_parser(
        "remove-student", help="Remove a student from the gradebook"
    )
    remove_student_parser.add_argument("name", help="Name of the student to remove")

    subject_parser = subparsers.add_parser("add-subject", help="Add a subject")
    subject_parser.add_argument("name", help="Name of the subject to add")

    remove_subject_parser = subparsers.add_parser("remove-subject", help="Remove a subject")
    remove_subject_parser.add_argument("name", help="Name of the subject to remove")

    add_grade_parser = subparsers.add_parser("add-grade", help="Attach a grade to a student")
    add_grade_parser.add_argument("student", help="Student name")
    add_grade_parser.add_argument("subject", help="Subject name")
    add_grade_parser.add_argument("value", type=float, help="Grade value")
    add_grade_parser.add_argument("--weight", type=float, default=1.0, help="Grade weight")
    add_grade_parser.add_argument("--comment", help="Optional comment for the grade")

    report_parser = subparsers.add_parser(
        "report", help="Generate a textual report for a student"
    )
    report_parser.add_argument("student", help="Student name")

    subparsers.add_parser("class-average", help="Display the class average")
    subject_average_parser = subparsers.add_parser(
        "subject-average", help="Display the average for a subject"
    )
    subject_average_parser.add_argument("subject", help="Subject name")

    export_parser = subparsers.add_parser("export", help="Dump the gradebook as JSON")
    export_parser.add_argument(
        "--indent",
        type=int,
        default=2,
        help="Indentation level for the exported JSON (default: 2)",
    )

    subparsers.add_parser("list-students", help="List all registered students")
    subparsers.add_parser("list-subjects", help="List all available subjects")

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    data_path: Path = args.data
    gradebook = load_gradebook(data_path)

    try:
        if args.command == "add-student":
            gradebook.add_student(args.name)
            save_gradebook(data_path, gradebook)
            print(f"Student '{args.name}' added")
        elif args.command == "remove-student":
            gradebook.remove_student(args.name)
            save_gradebook(data_path, gradebook)
            print(f"Student '{args.name}' removed")
        elif args.command == "add-subject":
            gradebook.add_subject(args.name)
            save_gradebook(data_path, gradebook)
            print(f"Subject '{args.name}' added")
        elif args.command == "remove-subject":
            gradebook.remove_subject(args.name)
            save_gradebook(data_path, gradebook)
            print(f"Subject '{args.name}' removed")
        elif args.command == "add-grade":
            gradebook.add_grade(
                args.student,
                args.subject,
                args.value,
                weight=args.weight,
                comment=args.comment,
            )
            save_gradebook(data_path, gradebook)
            print(
                f"Grade {args.value} for subject '{args.subject}' "
                f"added to student '{args.student}'"
            )
        elif args.command == "report":
            print(gradebook.student_report(args.student))
        elif args.command == "class-average":
            average = gradebook.class_average()
            if math.isnan(average):
                print("No grades available yet")
            else:
                print(f"Class average: {average:.2f}")
        elif args.command == "subject-average":
            average = gradebook.subject_average(args.subject)
            if math.isnan(average):
                print("No grades available yet")
            else:
                print(f"Average for {args.subject}: {average:.2f}")
        elif args.command == "export":
            json.dump(gradebook.to_dict(), sys.stdout, indent=args.indent, ensure_ascii=False)
            print()
        elif args.command == "list-students":
            for student in sorted(gradebook._students):
                print(student)
        elif args.command == "list-subjects":
            for subject in sorted(gradebook._subjects):
                print(subject)
        else:
            parser.error("Unknown command")
            return 2
    except (ValueError, KeyError) as exc:
        parser.error(str(exc))
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
