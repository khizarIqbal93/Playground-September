const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

function createResponse(status, body) {
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: status,
    body: JSON.stringify(body),
  };
}

exports.handler = async (event, context, callback) => {
  // parse event body
  const eventBodyJSON = JSON.parse(event.body);

  //   Code here to update database and other things!

  // generate message based on order status
  let message = '';
  switch (eventBodyJSON.orderStatus) {
    case 'DISPATCHED':
      message =
        'Your order has been dispatched! It will be with you in 1-3 business days.';
      break;
    case 'DELIVERED':
      message =
        'Your order has been successfully delivered! Thank you for ordering with us!';
      break;
    default:
      return callback(
        null,
        createResponse(400, {
          error: 'Invalid order status',
        })
      );
  }

  const params = {
    MessageAttributes: {
      OrderStatus: {
        DataType: 'String',
        StringValue: eventBodyJSON.orderStatus,
      },
      CustomerEmail: {
        DataType: 'String',
        StringValue: eventBodyJSON.customerEmail,
      },
      OrderId: {
        DataType: 'String',
        StringValue: eventBodyJSON.orderId,
      },
    },
    MessageBody: message,
    QueueUrl: 'QUEUE URL HERE',
  };

  try {
    const resp = await sqs.sendMessage(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify('message sent to SQS'),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
