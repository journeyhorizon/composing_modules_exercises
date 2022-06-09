//Which function is considered impure? and why
//Which function is considered pure? and why
//Try to make impure function become pure function if you think it need the transformation
//Try to refactor the code as well

const checkValidArguments = (args = {}) => {
  const {
    publicData,
    protectedData
  } = args;

  if (!publicData?.isHuman) {
    throw (new Error('Love Death + Robot'));
  }

  if (!protectedData?.isImpostor) {
    throw (new Error('You are too good to be here'));
  }

  return true;
}

const createParams = ({
  metadata,
  publicData,
}) => {
  const params = {};
  const moodsAndActions = require('./moods_and_actions.json');

  if (metadata.isHavingFun) {
    params.action = moodsAndActions['happy'];
  }

  if (metadata.isBeingSad) {
    params.action = moodsAndActions['sad'];
  }

  if (metadata.isForkingTired) {
    params.action = moodsAndActions['tired'];
  }

  if (metadata.isAnnoyed) {
    console.log('F*ck this sh!t!');
    params.action = moodsAndActions['annoyed'];
  }

  if (publicData.role === 'Astronaut') {
    params.salary = 200;
  }

  if (publicData.role === 'Developer') {
    console.info('You will be a slave to the codes')
    params.salary = 0;
  }

  return params;
}

const logging = async (params) => {
  const fs = require('fs');
  try {
    fs.writeFileSync('yours.json', JSON.stringify(params));
  } catch (err) {
    console.error(err);
  }
}

const startShadyActivities = ({
  action,
  salary
}) => {
  const flag = {
    action: false,
    salary: false
  };

  if (!!action) {
    const fs = require('fs');
    try {
      fs.writeFileSync('action.txt',
        `Một hai ba năm, cậu có đánh rơi nhịp nào không. Nếu câu trả lời thì hãy ${action} tớ ngay đi`);
      flag.action = true;
    } catch (err) {
      console.error(err);
    }
  }

  if (typeof salary !== 'undefined') {
    const fs = require('fs');
    try {
      fs.writeFileSync('salary.txt',
        salary > 0
          ? `Nhà giàu, mỗi tháng lãnh ${salary} từng đây tiền :v tiêu sao cho hết`
          : `Tóm tắt là: "Nghèo"`);
      flag.salary = true;
    } catch (err) {
      console.error(err);
    }
  }

  return flag.action && flag.salary
    ? {
      message: 'Happy tree friend'
    }
    : {
      message: 'Something is amiss, Ét ô Ét',
    };
}

const format = data => {
  const crypto = require('crypto');
  const algorithm = 'aes-256-cbc';
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  const encrypted = Buffer.concat([cipher.update(data.toString()), cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function initProgram(args) {
  checkValidArguments(args);
  const params = createParams(args);
  logging(params);
  const result = startShadyActivities(params);
  return format(result);
}

console.log(initProgram({
  metadata: {
    isHavingFun: true
  },
  publicData: {
    isHuman: true,
    role: 'Developer'
  },
  protectedData: {
    isImpostor: true
  }
}));
