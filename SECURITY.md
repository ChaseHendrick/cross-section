# Security

Cross-Sections is a static page you open locally or from a static host. It has no account, no server of its own and no secret it holds for you. It makes no network requests.

## What to report

A vulnerability is something that lets content you did not mean to trust run in the page or reach your data:

- script running in the page through the address bar (the `#scene?cuts=...` hash), a caption, or anything else a link can carry
- the page sending data anywhere, or reading data from another origin
- a launcher in `run/` serving anything beyond this folder, or to anything beyond your own computer

Not a vulnerability: a drawing that is wrong, a caption that is inaccurate, a scene that runs slowly. Use the [issue tracker](https://github.com/ChaseHendrick/cross-section/issues) for those.

## How to report

This project is no longer maintained, so a report may not get a response or a fix. If you are running a fork, check it yourself.


Use GitHub's private advisory on this repository: **[Report a vulnerability](https://github.com/ChaseHendrick/cross-section/security/advisories/new)**. Do not open a public issue for a real one.
