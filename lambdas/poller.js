console.log('Loading function');
var aws = require('aws-sdk');
var ses = new aws.SES({ region: 'eu-west-1' });

exports.handler = async event => {
  for (const { messageAttributes, body } of event.Records) {
    var params = {
      Destination: {
        ToAddresses: [messageAttributes.CustomerEmail.stringValue],
      },
      Message: {
        Body: {
          Text: { Data: body },
        },

        Subject: { Data: 'Your order update' },
      },
      Source: messageAttributes.CustomerEmail.stringValue,
    };

    try {
      const sesRes = await ses.sendEmail(params).promise();
      console.log('email sent');
    } catch (err) {
      console.log(err);
    }
  }
  return `Successfully processed ${event.Records.length} messages.`;
};
