const { google } = require('googleapis');
const { defaultResponse } = require('../common/responses');

const playintegrity = google.playintegrity('v1');

const packageName = process.env.PACKAGE_NAME;
const clientEmail = process.env.CLIENT_EMAIL;
const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
const scopes = ['https://www.googleapis.com/auth/playintegrity'];

const client = new google.auth.JWT(clientEmail, undefined, privateKey, scopes);
google.options({ auth: client });

//* ------------------------------  Verify Token  ----------------------------------- *//

exports.integrityCheck = async (req, res) => {
  try {
    const { token = 'none' } = req.body;

    console.log(req.body);

    if (token === 'none') {
      return defaultResponse(res, { status: 'no_token_provided' }, 400);
    }

    const verdict = await playintegrity.v1.decodeIntegrityToken({
      packageName,
      requestBody: {
        integrityToken: token,
      },
    });

    console.log(verdict.data.tokenPayloadExternal);

    // const token = jwt.sign('', process.env.JWT_PRIVATE_KEY, {
    //   expiresIn: '24h',
    // });

    return defaultResponse(res, verdict.data.tokenPayloadExternal, 200);
  } catch (err) {
    return defaultResponse(res, err?.response?.data, 400);
  }
};
