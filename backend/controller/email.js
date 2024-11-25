const nodemailer = require("nodemailer");
const {
  emailHost,
  emailPort,
  emailUser,
  emailPass,
} = require("../secrets/secrets");

async function sendEmail(to, base64Content, fileName, subject, text, html) {
  let transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  if (to && base64Content && fileName && subject && text && html) {
    console.log(fileName)
    try {
      
      const mailOptions = {
        from: '"DTC Support" <support@dhayreshwartransport.com>',
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: [
          {
            filename: fileName,
            content: base64Content,
            encoding: "base64",
          },
        ],
          };
        
      return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error('Error sending email:', error.message);  
                return reject(error);  
              } else {
                console.log('Email sent successfully:', info.response);  
                return resolve(info);  
              }
            });
          });
    } catch (err) {
      console.log(err.message);
    }
  } else if (to && subject && text && html) {
    try {
      let info = await transporter.sendMail({
        from: '"DTC Support" <support@jaisantoshimaatransport.com>',
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: [],
      });
    } catch (err) {
      console.log(err.message);
    }
  } else {
    throw new Error("Parameters are missing!");
  }

}

// sendEmail()
//   .then((response) => console.log("Email sent"))
//   .catch(console.error);

module.exports = sendEmail;
