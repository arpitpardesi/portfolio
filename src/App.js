import './App.css';
import Footer from './components/footer';
import Header from './components/header';

function App() {
  return (
    <div className="App">
      {/* Header */}
      <Header />
      <h1>Hi!</h1>
      <p>
        My name is Arpit Pardesi.<br/><br/>
          This site is currently under development. 
      </p>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
