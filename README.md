<div align="center">
  
![Lambda Curry Logo](https://lambdacurry.dev/favicon.ico)

# Welcome to Medusa Forms by Lambda Curry!

**Digital products made easy**

*Controlled form components for Medusa Admin and Medusa UI applications*

[![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)](https://lambda-curry.github.io/medusa-forms/?path=/docs/0-1-hello-world-start-here--docs)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

---

*Built with expertise by [Lambda Curry](https://lambdacurry.dev) - your trusted Medusa development partners*

</div>

## 🚀 About This Library

A controlled form components library for Medusa Admin and Medusa UI applications.

Checkout our [Storybook Documentation](https://lambda-curry.github.io/medusa-forms/?path=/docs/0-1-hello-world-start-here--docs) to see the components in action and get started.

## ✨ Features

- **Controlled Components**: All form components are controlled and work seamlessly with react-hook-form
- **Medusa UI Integration**: Built specifically for Medusa Admin and Medusa UI design system
- **TypeScript Support**: Full TypeScript support with proper type definitions
- **Storybook Documentation**: Comprehensive documentation and examples

## 📦 Components

- `ControlledInput` - Text input with validation
- `ControlledTextArea` - Multi-line text input
- `ControlledSelect` - Dropdown selection
- `ControlledCheckbox` - Checkbox input
- `ControlledDatePicker` - Date selection
- `ControlledCurrencyInput` - Currency input with formatting

## 🏁 Getting Started

Step 1: Install dependencies

```bash
yarn install
```

Step 2: Start Storybook

```bash
yarn dev
```

## 🔧 Development

### PR Previews

When you create a pull request, a preview of the Storybook documentation will be automatically deployed. You can find the link to the preview in the PR comments. This allows you to review changes to the documentation and components before merging.

Preview URLs follow this format:
```
https://lambda-curry.github.io/medusa-forms/pr-preview/pr-[PR_NUMBER]/
```

#### How PR Previews Work

The PR preview system:
1. Builds the Storybook documentation for each PR
2. Deploys it to a PR-specific directory on the `gh-pages` branch
3. Adds a comment to the PR with a link to the preview
4. **Automatically updates the preview when you push new changes to the PR**
5. Cleans up the preview when the PR is closed

#### GitHub Environment Setup

For PR previews to work properly, you need to set up a GitHub environment:

1. Go to your repository settings
2. Navigate to "Environments"
3. Create a new environment named `pr-preview`
4. Configure environment protection rules as needed:
   - You can require reviewers to approve deployment
   - You can limit deployment to specific branches
   - You can add wait timers before deployment

The main branch will continue to deploy to the `github-pages` environment.

#### Troubleshooting PR Previews

If you encounter a 404 error when accessing the PR preview:

1. Make sure the PR build has completed successfully by checking the GitHub Actions tab
2. Verify that the repository has GitHub Pages enabled and configured to deploy from the `gh-pages` branch
3. Check that the PR preview comment contains the correct URL
4. Ensure the PR has been approved for deployment if environment protection rules are enabled
5. Try clearing your browser cache or using an incognito window

The PR preview is deployed to the `gh-pages` branch in a directory structure like:
```
/pr-preview/pr-[PR_NUMBER]/
```

---

<div align="center">

**Need help with your Medusa project?**

Lambda Curry specializes in Medusa development and can help you build amazing e-commerce experiences.

[Contact Lambda Curry](https://lambdacurry.dev/#contact-us) | [View Our Work](https://lambdacurry.dev)

</div>

