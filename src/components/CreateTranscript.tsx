import firebase from "firebase/app"
import * as React from "react"
import ReactGA from "react-ga"
import { InteractionType, MicrophoneDistance, OriginalMediaType, ProgressType, RecordingDeviceType } from "../enums"
import { database, storage } from "../firebaseApp"
import { IMetadata, ITranscript } from "../interfaces"

interface IProps {
  transcriptCreated: (transcriptId: string) => void
}

interface IState {
  fileUploaded: boolean
  transcriptId?: string
  audioTopic: string
  industryNaicsCodeOfAudio: string
  interactionType: InteractionType
  isSubmitting: boolean
  languageCodes: ReadonlyArray<string>
  microphoneDistance: MicrophoneDistance
  originalMediaType: OriginalMediaType
  recordingDeviceName: string
  recordingDeviceType: RecordingDeviceType
  speechContextsPhrases: string
  submitButtonPressed: boolean
  percent?: number
}

interface IProps {
  file: File
  userId: string
}

class CreateTranscript extends React.Component<IProps, IState> {
  public state: Readonly<IState> = {
    audioTopic: "",
    fileUploaded: false,
    industryNaicsCodeOfAudio: "",
    interactionType: InteractionType.Unspecified,
    isSubmitting: false,
    languageCodes: ["nb-NO", "", "", ""],
    microphoneDistance: MicrophoneDistance.Unspecified,
    originalMediaType: OriginalMediaType.Unspecified,
    recordingDeviceName: "",
    recordingDeviceType: RecordingDeviceType.Unspecified,
    speechContextsPhrases: "",
    submitButtonPressed: false,
  }

  public componentDidMount() {
    this.uploadFile()
  }

  public componentDidUpdate() {
    if (this.state.submitButtonPressed === true && this.state.isSubmitting === false && this.state.fileUploaded === true && this.state.transcriptId !== undefined) {
      this.submit()
    }
  }

  public render() {
    return (
      <main id="transcript">
        <div className="create">
          <h2 className="org-text-xl">{this.props.file.name}</h2>
          <form className="dropForm" onSubmit={this.handleSubmit}>
            <fieldset disabled={this.state.submitButtonPressed === true}>
              <label className="org-label">
                Language
                <select value={this.state.languageCodes[0]} onChange={event => this.handleLanguageChange(0, event)}>
                  {this.availableLanguages()}
                </select>
                <select data-testid="languages" value={this.state.languageCodes[1]} onChange={event => this.handleLanguageChange(1, event)}>
                  {this.availableLanguages()}
                </select>
                <select data-testid="languages" value={this.state.languageCodes[2]} onChange={event => this.handleLanguageChange(2, event)}>
                  {this.availableLanguages()}
                </select>
                <select data-testid="languages" value={this.state.languageCodes[3]} onChange={event => this.handleLanguageChange(3, event)}>
                  {this.availableLanguages()}
                </select>
              </label>
              <label className="org-label">
                Type
                <select value={this.state.interactionType} onChange={this.handleInteractionTypeChange}>
                  <option value={InteractionType.Unspecified}>Unknown or other type</option>
                  <option value={InteractionType.Discussion}>Discussion - Multiple people in conversation or discussion, for example in meeting with two or more active participants</option>
                  <option value={InteractionType.Presentaton}>Presentation - One or more people lecture or present to others, mostly without interruption</option>
                  <option value={InteractionType.PhoneCall}>Telephone or video conference call - Two or more people who are not in the same room actively participate in conversation.</option>
                  <option value={InteractionType.Voicemail}>Voicemail / Voicemail - Recordings intended for another person to listen to.</option>
                  <option value={InteractionType.ProfessionallyProduced}>Professionally produced - For example TV show, podcast.</option>
                  <option value={InteractionType.Dictation}>Diction - Reading documents such as text messages, emails or reports.</option>
                </select>
              </label>

              <label className="org-label">
              NAICS Code
                <small>
                The 6-digit <a href="https://www.naics.com/search/">NAICS Code</a> which is closest to the topics discussed in the audio file.
                </small>
                <input value={this.state.industryNaicsCodeOfAudio} type="text" onChange={this.handleIndustryNaicsCodeOfAudioChange} />
              </label>

              <label className="org-label">
              Microphone Distance
                <select value={this.state.microphoneDistance} onChange={this.handleMicrophoneDistanceChange}>
                  <option value={MicrophoneDistance.Unspecified}>Unknown</option>
                  <option value={MicrophoneDistance.Nearfield}>Less then 1 meter</option>
                  <option value={MicrophoneDistance.Midfield}>Less then 3 meter</option>
                  <option value={MicrophoneDistance.Farfield}>More then 3 meter</option>
                </select>
              </label>
              <label className="org-label">
                Original media type
                <select value={this.state.originalMediaType} onChange={this.handleOriginalMediaTypeChange}>
                  <option value={OriginalMediaType.Unspecified}>Unkown</option>
                  <option value={OriginalMediaType.Audio}>Audio - Sound recordings</option>
                  <option value={OriginalMediaType.Video}>Video - The audio originally comes from a video recording </option>
                </select>
              </label>
              <label className="org-label">
              Where or how was the recording done?
                <select value={this.state.recordingDeviceType} onChange={this.handleRecordingDeviceTypeChange}>
                  <option value={RecordingDeviceType.Unspecified}>Unkown</option>
                  <option value={RecordingDeviceType.Smartphone}>Smartphone - The recording was done on a smartphone</option>
                  <option value={RecordingDeviceType.PC}>PC - The recording was done with a PC or tablet</option>
                  <option value={RecordingDeviceType.PhoneLine}>Telephone line - The recording was made over a telephone line</option>
                  <option value={RecordingDeviceType.Vehicle}>Vehicle - The recording was done in a vehicle</option>
                  <option value={RecordingDeviceType.OtherOutdoorDevice}>Outdoor - The recording was done outdoors</option>
                  <option value={RecordingDeviceType.OtherIndoorDevice}>Indoors - The recording was done indoors</option>
                </select>
              </label>

              <label className="org-label">
              Name of recording equipment
                <small>Example: iPhone X, Polycom SoundStation IP 6000, POTS, VOIP or Cardioid Microphone</small>
                <input value={this.state.recordingDeviceName} type="text" onChange={this.handleRecordingDeviceNameChange} />
              </label>

              <label className="org-label">
                Subject
                <small>What is the audio file about?</small>
                <textarea value={this.state.audioTopic} onChange={this.handleAudioTopicChange} />
              </label>

              <label className="org-label">
                Context
                <small>Provide "hints" to speech recognition to favor specific words and phrases in the results, in the form of a comma-separated list.</small>
                <textarea value={this.state.speechContextsPhrases} onChange={this.handleSpeechContextChange} />
              </label>

              <button className="org-btn org-btn--primary" disabled={this.submitButtonIsDisabled()} type="submit">
                {(() => {
                  if (this.state.submitButtonPressed === true && this.state.fileUploaded === false && this.state.percent !== undefined) {
                    return `Uploading${this.state.percent}%`
                  } else {
                    return "Upload"
                  }
                })()}
              </button>
            </fieldset>
          </form>
        </div>
      </main>
    )
  }

  private async submit() {
    this.setState({ isSubmitting: true })

    const file = this.props.file

    const fileNameAndExtension = [file.name.substr(0, file.name.lastIndexOf(".")), file.name.substr(file.name.lastIndexOf(".") + 1, file.name.length)]

    let name = ""
    let fileExtension = ""
    if (fileNameAndExtension.length === 2) {
      name = fileNameAndExtension[0]
      fileExtension = fileNameAndExtension[1]
    }

    // Metadata

    const metadata: IMetadata = {
      fileExtension,
      interactionType: this.state.interactionType,
      languageCodes: this.selectedLanguageCodes(),
      microphoneDistance: this.state.microphoneDistance,
      originalMediaType: this.state.originalMediaType,
      originalMimeType: file.type,
      recordingDeviceType: this.state.recordingDeviceType,
    }

    // Add non empty fields

    if (this.state.audioTopic !== "") {
      metadata.audioTopic = this.state.audioTopic
    }

    const industryNaicsCodeOfAudio = parseInt(this.state.industryNaicsCodeOfAudio, 10)

    if (!isNaN(industryNaicsCodeOfAudio)) {
      metadata.industryNaicsCodeOfAudio = industryNaicsCodeOfAudio
    }

    if (this.state.recordingDeviceName !== "") {
      metadata.recordingDeviceName = this.state.recordingDeviceName
    }

    // Clean up phrases

    const phrases = this.state.speechContextsPhrases
      .split(",")
      .filter(phrase => {
        return phrase.trim()
      })
      .map(phrase => phrase.trim())

    if (phrases.length > 0) {
      metadata.speechContexts = [{ phrases }]
    }

    const transcriptId = this.state.transcriptId

    const transcript: ITranscript = {
      id: transcriptId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      metadata,
      name,
      status: {
        percent: this.state.percent,
        progress: ProgressType.Uploading,
      },
      userId: this.props.userId,
    }

    try {
      await database.doc(`transcripts/${transcriptId}`).set(transcript)

      this.props.transcriptCreated(transcriptId)
    } catch (error) {
      console.error(error)
      ReactGA.exception({
        description: error.message,
        fatal: false,
      })
    }
  }

  private uploadFile() {
    // Immediately start uploading the file

    const transcriptId = database.collection("/transcripts").doc().id

    const uploadTask = storage
      .ref(`/media/${this.props.userId}`)
      .child(`${transcriptId}-original`)
      .put(this.props.file)

    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot: firebase.storage.UploadTaskSnapshot) => {
        this.setState({
          percent: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        })
      },
      error => {
        ReactGA.exception({
          description: error.message,
          fatal: false,
        })

        /*FIXME https://firebase.google.com/docs/storage/web/handle-errors
        
        switch (error.code) {
          case "storage/unauthorized":
            // User doesn't have permission to access the object
            break
          case "storage/canceled":
            // User canceled the upload
            break
          case "storage/unknown":
            // Unknown error occurred, inspect error.serverResponse
            console.error(error)
            console.log("error during upload from error section")
            break
        }*/
      },
      () => {
        this.setState({ fileUploaded: true, transcriptId })
      },
    )
  }

  private handleLanguageChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
    const languageCodes = [...this.state.languageCodes]
    languageCodes[index] = event.target.value

    this.setState({ languageCodes })
  }

  private handleInteractionTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ interactionType: event.target.value as InteractionType })
  }

  private handleMicrophoneDistanceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ microphoneDistance: event.target.value as MicrophoneDistance })
  }

  private handleOriginalMediaTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ originalMediaType: event.target.value as OriginalMediaType })
  }

  private handleRecordingDeviceTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ recordingDeviceType: event.target.value as RecordingDeviceType })
  }

  private handleIndustryNaicsCodeOfAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ industryNaicsCodeOfAudio: event.target.value })
  }

  private handleRecordingDeviceNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ recordingDeviceName: event.target.value })
  }

  private handleAudioTopicChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ audioTopic: event.target.value })
  }

  private handleSpeechContextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ speechContextsPhrases: event.target.value })
  }

  private handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const selectedLanguageCodes = this.selectedLanguageCodes()

    if (selectedLanguageCodes.length === 0) {
      return
    }

    this.setState({ submitButtonPressed: true })
  }

  private selectedLanguageCodes() {
    const languageCodes = this.state.languageCodes

    // This will remove unselected languages (no value) and remove duplicates
    const selectedLanguageCodes = languageCodes.filter((language, index, array) => {
      return language !== "" && array.indexOf(language) === index
    })

    return selectedLanguageCodes
  }

  private submitButtonIsDisabled() {
    return this.selectedLanguageCodes().length === 0
  }

  private availableLanguages() {
    const languages = new Map([
            ["nb-NO", "Norwegian"],
            ["sv-SE", "Swedish"],
            ["da-DK", "Danish"],
            ["en-GB", "English (UK)"],
            ["en-US", "English (US)"],
            ["", "---"],
            ["af-ZA", "Afrikaans"],
            ["am-ET", "Amharic"],
            ["ar-DZ", "Arabic (Algeria)"],
            ["ar-bra", "arabic (Bahrain)"],
            ["ar-EC", "Arabic (Egypt)"],
            ["ar-AE", "Arab (United Arab Emirates)"],
            ["ar-IQ", "Arabic (Iraq)"],
            ["ar-IL", "Arab (Israel)"],
            ["ar-JO", "Arabic (Jordan)"],
            ["ar-KW", "Arabic (Kuwait)"],
            ["ar-LB", "Arabic (Lebanon)"],
            ["ar-MA", "Arabic (Morocco)"],
            ["ar-OM", "Arabic (Oman)"],
            ["ar-QA", "Arabic (Qatar)"],
            ["ar-SA", "Arab (Saudi Arabia)"],
            ["ar-PS", "Arab (State of Palestine)"],
            ["ar-TN", "Arabic (Tunisia)"],
            ["hy-AM", "Armenian"],
            ["az-AZ", "Azerbaijani"],
            ["eu-ES", "Basque"],
            ["bn-IN", "Bengali (India)"],
            ["bn-BD", "Bengali (Bangladesh)"],
            ["bg-BG", "Bulgarian"],
            ["da-DK", "Danish"],
            ["en-AU", "English (Australia)"],
            ["en-CA", "English (Canada)"],
            ["en-PH", "English (Philippines)"],
            ["en-GH", "English (Ghana)"],
            ["en-IN", "English (India)"],
            ["en-IE", "English (Ireland)"],
            ["en-KE", "English (Kenya)"],
            ["en-NZ", "English (New Zealand)"],
            ["en-NG", "English (Nigeria)"],
            ["en-GB", "English (UK)"],
            ["en-ZA", "English (South Africa)"],
            ["en-TZ", "English (Tanzania)"],
            ["en-US", "English (US)"],
            ["file PH", "Filipino"],
            ["fi-FI", "Finnish"],
            ["fr-CA", "French (Canada)"],
            ["fr-FR", "French (France)"],
            ["gl-ES", "Galician"],
            ["ka-GE", "Georgian"],
            ["el-GR", "Greek"],
            ["gu-IN", "Gujarati"],
            ["he-IL", "Hebrew"],
            ["hi-IN", "Hindi"],
            ["ID ID", "Indonesian"],
            ["is-IS", "Icelandic"],
            ["IT-IT", "Italian"],
            ["yes-JP", "Japanese"],
            ["Jv ID", "Javanese"],
            ["kn-IN", "Kannada"],
            ["ca-ES", "Catalan"],
            ["km-KH", "Khmer"],
            ["yue-Hant-HK", "Chinese, Cantonese (Traditional, Hong Kong)"],
            ["cmn-Hans-HK", "Chinese Mandarin (Simplified, Hong Kong)"],
            ["cmn-Hans-CN", "Chinese Mandarin (Simplified, China)"],
            ["cmn-Hant-TW", "Chinese Mandarin (Traditional, Taiwan)"],
            ["ko-KR", "Korean"],
            ["hr-HR", "Croatian"],
            ["lo-LA", "Lao"],
            ["lv-LV", "Latvian"],
            ["LT-LT", "Lithuanian"],
            ["ms-MY", "Malay"],
            ["ml-IN", "Malayalam"],
            ["mr-IN", "Marathi"],
            ["nl-NL", "Dutch"],
            ["ne-NP", "Nepali"],
            ["nb-NO", "Norwegian"],
            ["Fa-IR", "Persian"],
            ["pl-PL", "Polish"],
            ["pt-BR", "Portuguese (Brazil)"],
            ["pt-PT", "Portuguese (Portugal)"],
            ["ro-RO", "Romanian"],
            ["ru-ru", "Russian"],
            ["sr-RS", "Serbian"],
            ["si-LK", "Sinhala"],
            ["sk-SK", "Slovak"],
            ["sl-SI", "Slovenian"],
            ["es-AR", "Spanish (Argentina)"],
            ["es-BO", "Spanish (Bolivia)"],
            ["es-CL", "Spanish (Chile)"],
            ["es-CO", "Spanish (Colombia)"],
            ["es-CR", "Spanish (Costa Rica)"],
            ["es-DO", "Spanish (Dominican Republic)"],
            ["es-EC", "Spanish (Ecuador)"],
            ["es-SV", "Spanish (El Salvador)"],
            ["es-GT", "Spanish (Guatemala)"],
            ["es-HN", "Spanish (Honduras)"],
            ["es-MX", "Spanish (Mexico)"],
            ["es-NI", "Spanish (Nicaragua)"],
            ["es-PA", "Spanish (Panama)"],
            ["es-PY", "Spanish (Paraguay)"],
            ["es-PE", "Spanish (Peru)"],
            ["es-PR", "Spanish (Puerto Rico)"],
            ["es-ES", "Spanish (Spain)"],
            ["es-UY", "Spanish (Uruguay)"],
            ["es-US", "Spanish (US)"],
            ["es-VE", "Spanish (Venezuela)"],
            ["su-id", "Sundanese"],
            ["sv-SE", "Swedish"],
            ["sw-KE", "Swahili (Kenya)"],
            ["sw-TZ", "Swahili (Tanzania)"],
            ["ta-IN", "Tamil (India)"],
            ["ta-MY", "Tamil (Malaysia)"],
            ["ta-SG", "Tamil (Singapore)"],
            ["ta-LK", "Tamil (Sri Lanka)"],
            ["te-IN", "Telugu"],
            ["th-TH", "Thai"],
            ["cs-CZ", "Czech Republic"],
            ["tr-TR", "Turkish"],
            ["de-DE", "German"],
            ["uk-UA", "Ukrainian"],
            ["hu-HU", "Hungarian"],
            ["Ur-IN", "Urdu (India)"],
            ["Ur-PK", "Urdu (Pakistan)"],
            ["vi-VN", "Vietnamese"],
            ["to-ZA", "Zulu"],
          ])

    return Array.from(languages).map(([key, value]) => (
      <option key={key} value={key}>
        {value}
      </option>
    ))
  }
}

export default CreateTranscript
