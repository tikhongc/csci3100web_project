//file for sending email to user
//using send grid to send email //https://app.sendgrid.com/guide
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


// types of email 

//welcome email
//user reovery email
//notification email ?

const WelcomeEmail = (email, name) => {
  sgMail.send({
        to: email,
        from: 'chiutikhong@yandex.com',
        subject: 'Thanks for joining in Cuery community!',
        text: `Welcome to the Cuery, ${name}. +introduction`,
        html: '<strong>and easy to do anywhere, even with Node.js</strong>'
    }).then(() => {
        console.log('WelcomeEmail sent')
      })
      .catch((error) => {
        console.error(error)
      })
}

const RecoveryEmail = (email,name,link) => {
  sgMail.send({
        to: email,
        from: 'chiutikhong@yandex.com',
        subject: 'Account Activation Link',
        text:`Hi ${name}!\n 
        Please click on the following link ${link} to reset your password. \n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    }).then(() => {
        console.log('RecoveryEmail sent')
      })
      .catch((error) => {
        console.error(error)
      })
}

const ConfirmationEmail = (email,name) => {
  sgMail.send({
      to: email,
      from: 'chiutikhong@yandex.com',
      subject: "Your password has been changed",
      text: `Hi ${name} \n 
      This is a confirmation that the password for your account ${email} has just been changed.\n`
  }).then(() => {
      console.log('ConfirmationEmail sent')
    })
    .catch((error) => {
      console.error(error)
    })
}

module.exports = {
    WelcomeEmail,
    RecoveryEmail,
    ConfirmationEmail,
}



