import React from "react"

const Index = () => {
  return (
    <main id="transcript">
      <h1>Welcome to Emory Cml transcription </h1>
      <p>
        This is a tool that converts speech to text via Google's speech to text API. We are currently in <a href="https://confluence.nrk.no/display/~n636391/Hva+kan+man+forvente+av+en+alfa+eller+beta+release">beta</a>, which means the tool is under development. This also means that one cannot expect support, but must accept to use the tool as it is at present. today's date.
      </p>
      <p>
      Although the tool does not convert with hundred percent accuracy from speech to text in all languages, we hope the result can be good enough for you to quickly orient yourself in your own recording effectively. You can export the text to a Word document yourself and edit the text you want there.
      </p>
      <p>The tool supports over 60 languages. Norwegian language works up to 80%, while English up to 90%. You can upload any type of audio file, but keep in mind that the audio file should be a maximum of 200 MB, and the maximum length should be less than 1 hour and 30 minutes.</p>

      <p>
      Finally, a few words about access and source protection. Using the tool requires logging in with your Emory Cml account. It is not possible to share a transcript link with others, so if you want to send the text to someone, it must first be exported to Word.
      </p>
      <p>Good luck !</p>

      <a href="/login">
        <button className="org-btn org-btn--primary login">Login </button>
      </a>
    </main>
  )
}

export default Index
