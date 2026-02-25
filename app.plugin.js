const {
  withProjectBuildGradle,
  createRunOncePlugin,
} = require('@expo/config-plugins');
const pkg = require('./package.json');

const MAVEN_REPO_BLOCK = `
        maven {
            url = uri("https://maven.pkg.github.com/lokal-app/device-telemetry-toolkit")
            credentials {
                username = System.getenv("GITHUB_USERNAME") ?: "lokal-app"
                password = System.getenv("GITHUB_TOKEN") ?: ""
            }
        }`;

const ALLPROJECTS_BLOCK = `
allprojects {
    repositories {${MAVEN_REPO_BLOCK}
    }
}
`;

function addDeviceTelemetryGithubPackageRepo(config) {
  return withProjectBuildGradle(config, (gradleConfig) => {
    const { contents } = gradleConfig.modResults;

    if (
      contents.includes(
        'maven.pkg.github.com/lokal-app/device-telemetry-toolkit'
      )
    ) {
      return gradleConfig;
    }

    const allprojectsMatch = contents.match(/\ballprojects\s*\{/);

    if (allprojectsMatch) {
      const blockStart = allprojectsMatch.index + allprojectsMatch[0].length;
      const repoMatch = contents
        .slice(blockStart)
        .match(/^\s*repositories\s*\{/);

      if (repoMatch) {
        const repoOpenBraceIndex =
          blockStart + repoMatch.index + repoMatch[0].length - 1;
        gradleConfig.modResults.contents =
          contents.slice(0, repoOpenBraceIndex + 1) +
          MAVEN_REPO_BLOCK +
          contents.slice(repoOpenBraceIndex + 1);
      } else {
        const repoBlock = `\n    repositories {${MAVEN_REPO_BLOCK}\n    }`;
        gradleConfig.modResults.contents =
          contents.slice(0, blockStart) +
          repoBlock +
          contents.slice(blockStart);
      }
    } else {
      gradleConfig.modResults.contents = contents + '\n' + ALLPROJECTS_BLOCK;
    }

    return gradleConfig;
  });
}

module.exports = createRunOncePlugin(
  addDeviceTelemetryGithubPackageRepo,
  pkg.name,
  pkg.version
);
