import * as React from "react"
import ReactGA from "react-ga"
import { connect } from "react-redux"
import { BrowserRouter, Link, Redirect, Route, Switch } from "react-router-dom"
import "../css/App.css"
import "../css/ModalWindow.css"
import Auth from "./Auth"
import GAListener from "./GAListener"
import Index from "./Index"
import Transcripts from "./Transcripts"

const trackingCode = process.env.GOOGLE_ANALYTICS_PROPERTY_ID

if (trackingCode) {
  ReactGA.initialize(trackingCode, {
    debug: false, // process.env.NODE_ENV === "development",
    titleCase: false,
  })
}

interface IStateProps {
  user?: firebase.User
}

class App extends React.Component<IStateProps, IState> {
  public render() {
    return (
      <BrowserRouter>
        <GAListener>
          <div className="container">
            <header className="org-color-dark">
              <svg height="17" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 55.9 20" enableBackground="new 0 0 55.9 20" xmlSpace="preserve">
                <g>
                  
                </g>
              </svg>
              <h1 className="org-text-l logo">
                <Link to="/"> Emory Cml Transcriber {process.env.NODE_ENV === "development" ? "" : ""}</Link>
              </h1>

              <Auth />
            </header>
            <Switch>
              <Redirect from="/login" to="/" />
              <Route path="/" exact={true} render={() => (this.props.user.uid ? <Redirect to="/transcripts" /> : <Index />)} />
              <Route path="/transcripts/:id?" render={props => <Transcripts {...props} user={this.props.user} />} />
            </Switch>
          </div>
        </GAListener>
      </BrowserRouter>
    )
  }
}

const mapStateToProps = (state: IStateProps): IStateProps => {
  return {
    user: state.firebase.auth,
  }
}

export default connect<IStateProps, void, void>(mapStateToProps)(App)
