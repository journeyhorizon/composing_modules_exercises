import sgMail from ".";
import config from "../config/default_configuration";

export const sendEmail = async (params) => {
  return sgMail.send({
    from: {
      ...config.sendgridService.defaultSender,
    },
    ...params
  });
}