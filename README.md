# budgetwise

COMP 4350 - Project Code


Folders & Files of note:

- **course-work/** (course work files, like sprint worksheets)
- ACKNOWLEDGMENTS.md (For citations)

*API*: <https://docs.google.com/document/d/1tYB-VAGl5qK_Bi0bbtqdJ5mbaJzvSiDYkD_54Wbm0mI/edit?usp=sharing>


# How to run project

> [!NOTE]
> Most of the developement took place on Mac hardware.

## Backend setup


## API setup


## Frontend setup


# Branching workflow

> [!IMPORTANT]
> Some of these standards may not be implemented fully as of writting

Repo is using a GitFlow-like workflow.


| Branch              | Description                                                                                                          | Branches from     | Merges to                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------- |
| `main`              | For production active code                                                                                           | NONE              | N/A                         |
| `dev`               | For development code                                                                                                 | `main`            |                             |
| `release/{VERSION}` | For releases                                                                                                         | `dev`             | `dev`, `main`               |
| `feature/{TITLE}`   | For work on features                                                                                                 | `dev`             | `dev`                       |
| `hotfix/{TITLE}`    | Fixes for critical errors in the production code on `main`                                                           | `main`            | `main`, `dev`               |
| `test/{TITLE}`      | For testing. Modifications and additions made here are never to be merged or pulled from by other non test branches. | (ANY)             | only other `test/` branches |
| `doc/{TITLE}`       | For documentation updates                                                                                            | `dev`, `feature/` | `dev`, `feature/`           |



Development branch `dev`

- All merges to `dev` must,
  - be up to date on the `dev` branch's current commits (rebase)
  - pass implemented code tests (At the time of writing some linting check may be overly stringent and fail)
  - have the appropriate reviewer confirm the changes (which includes running the code)


Feature branch `feature/`

- Feature branches need to be connected to atleast 1 issue.


# Versioning

V**X**.0.0 - For major releases (Sprints)

V0.**X**.0 - For minor releases (Features)

V0.0.**X** - For patches (Hotfixes, missing deliverables, etc.)
