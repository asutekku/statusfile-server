# Status File Viewer - Server-side solution

This is a server-side tool to render the contents of the Debian's status -file. 

It is built with Typescript and Node.js and meant to use as little dependencies as possible.

## Main features

- Easy to extend and understand
- Uses no additional dependencies outside of native node.js and typescript
- Comes with a custom templating engine Omi for the project
- Doesn't require any HTML apart from Omi to be written

## Installation

To get the project, run the following commands.

```
yarn install
tsc
node dist/app.js
open http://localhost:8080/
```