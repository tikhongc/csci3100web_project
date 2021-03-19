

//file for sending email to user

//Using Mailtrap to test

let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "5bf6cfd9ce641e",
      pass: "422e41175bb747"
    }
  });

  const message = {
    from: '1205542199@ds.com',
    to: '1205542199@ds.com',
    subject: 'Test',
    html: '<h1>Test</h1>',
    attachments: [
        { // Use a URL as an attachment
          filename: 'Test',
          path: 'https://www.w3schools.com/html/html_intro.asp'
    ]
};

transport.sendMail(message, function(err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(info);
    }
});