const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please fill in all fields' })
    }

    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Resend's test sender, works immediately
      to: process.env.CONTACT_EMAIL,
      reply_to: email,
      subject: `New message from ${name}`,
      html: `
        <h3>New Contact Form Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    res.status(200).json({ message: 'Message sent successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message })
  }
}

module.exports = { sendContactMessage }