# Tordie 6 Source Code

**Type:** Canvas Application · **Tech Stack:** Tauri / Valtio / Canva / React · **Status:** Active

## Introduction

Tordie is a powerful SVG generator with mathematical operations for use in Origami and scoring. This version has since been deprecated with plans for a web version in the near future.

After five versions of being a convoluted Python script/module hybrid, it is finally being converted into a user-friendly app. The version that was presented at OSME was V5, with source code still available [here](https://github.com/Moaesaycto/Tordie5).

This project is primary maintained by me, [Moae](https://moaesaycto.github.io/). If you like what I do, consider checking out some of my [other projects](https://moaesaycto.github.io/#/projects).

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.

Commercial use is not permitted without explicit permission from the author.

For commercial licensing inquiries, contact Moae (Moaesaycto): [moaesaycto.github.io/#/contact](https://moaesaycto.github.io/#/contact)

See the full [LICENSE](./LICENSE) file for details.

### Commercial Use

Commercial use is **not permitted** under this licence.

If you'd like to use this project or parts of it commercially, please [contact the author](https://moaesaycto.github.io/#/contact) to discuss licensing options (e.g. royalties or partnership).

## Setting Up

Firstly, you will need to install the following prerequisites to compile this code:
- [Rust + Cargo](https://rustup.rs)
- [Node.js + npm](https://nodejs.org)
- [Inkscape](https://inkscape.org) (Add this to your system Path variable)
- [ImageMagick](https://imagemagick.org)
- Tauri CLI: `cargo install tauri-cli`


Once installed, you can verify everything is working with:

```bash
cargo --version
npm --version
inkscape --version
magick -version
```
In the project root, be sure to run

```bash
npm install
```

## Preparing the Icons
The file `src-tauri` contains a file called `icon.bat`. This will automatically call `npx tauri icon <path>` and generate the respective icons for the different operating systems. Run the batch file from within `src-tauri`.

If you are not using Windows, you may need to handle this manually. The SVG data for the icons is in `src-tauri/svg`.

Additionally, there are some BMP files for use in the NSIS installer. These are not so important.

More information will be added to this section as development progresses.

## Running the App (Development Mode)
To run the code, you can run

```bash
npx run tauri dev
```

## Building the App
To build the app, be sure to compile the icons first as described above. Then, simply run:

```bash
npx run tauri build
```

If you are looking to lower the memory load, you can restrict the number of jobs by using the following:

```bash
npx run tauri build -- --jobs 2
```
