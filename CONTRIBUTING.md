# Contributing

**First off all, thank you for considering contributing to DartsMate! We welcome contributions from everyone. Whether it's a bug fix, a new feature, or improving documentation, your help is greatly appreciated!**

## Where to Start

The best place to start is by checking out the [Issues](https://github.com/timderes/dartsmate/issues). If an issue doesn't have an assigned contributor, feel free to claim it and start working on it!

You can also take a look at the [Projects](https://github.com/timderes/dartsmate/projects?query=is%3Aopen) tab to see if there are any ongoing tasks that you can contribute to.

### Look out for these issues

- <span style="color: #7057ff">**good first issue**</span>: These are usually smaller issues that are ideal for newcomers to the project. They are a great way to get familiar with the codebase and make your first contribution.

- <span style="color: #008672">**help wanted**</span>: Issues that need support or haven’t been assigned yet

## How to add a new app language

Thanks for helping and taking the time to translate DartsMate into your language! If you want to contribute a new language, please follow these steps:

1. Fork the repository and create a new branch for your language (e.g. `feat/add-spanish-language`).

2. Open `next-i18next.config.js` and add your language code to the `locales` array. For example, if you want to add Spanish, you would add `'es'` to the array.
   **NOTE: Use the `Set 1` language codes: [ISO 639 language codes](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)!**

3. Create a new folder in the `renderer/public/locales` directory with the name of your language code (e.g., `es` for Spanish).

4. Copy the contents of the `en` folder into your new language folder and translate the JSON files into your language.

5. Commit your changes and push the branch to your forked repository.

6. Open a pull request to the main repository and add any relevant details.
