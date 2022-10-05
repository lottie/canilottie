import * as github from '@actions/github';

async function run() {
  try {
    console.log('Running test');
    const secretToken = process.env.BODYMOVIN_PERSONAL_TOKEN || 'none secret';
    const octokit = github.getOctokit(secretToken);
    await octokit.rest.repos.createDispatchEvent({
      owner: 'lottie-animation-community',
      repo: 'tests',
      event_type: 'trigger-tests',
      client_payload: {},
    });
  } catch (error) {
    console.log('RUN ERROR: ', error);
  }
}

try {
  run();
} catch (error) {
  console.log('FAILED', error);
}
