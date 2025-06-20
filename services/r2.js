const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function getPresignedUrl(filename, mimetype) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: filename,
    ContentType: mimetype,
  });
  // URL ist 15 Minuten gültig
  const url = await getSignedUrl(r2, command, { expiresIn: 900 });
  return url;
}

module.exports = { r2, getPresignedUrl }; 