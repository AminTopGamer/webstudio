const { exec } = require('child_process');

module.exports = (req, res) => {
  exec('pnpm --filter=@webstudio-is/prisma-client generate && pnpm --filter @webstudio-is/prisma-client run migrations migrate', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      res.status(500).send(error.message);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      res.status(500).send(stderr);
      return;
    }
    console.log(`Stdout: ${stdout}`);
    res.status(200).send(stdout);
  });
};
