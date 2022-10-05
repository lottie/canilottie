import * as github from '@actions/github';
import yargs from 'yargs';

function getPayload(player) {
  if (player === 'lottie-web' || player === 'skottie') {
    return {
      player,
    };
  }
}

async function run() {
  try {
    console.log('Running test');
    const argv = yargs(process.argv).argv;
    const secretToken = process.env.BODYMOVIN_PERSONAL_TOKEN || 'none secret';
    const octokit = github.getOctokit(secretToken);
    const payload = getPayload(argv.player);
    if (payload) {
      await octokit.rest.repos.createDispatchEvent({
        owner: 'lottie-animation-community',
        repo: 'tests',
        event_type: 'trigger-tests',
        client_payload: payload,
      });
    }
  } catch (error) {
    console.log('RUN ERROR: ', error);
  }
}

try {
  run();
} catch (error) {
  console.log('FAILED', error);
}
