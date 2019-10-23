// Include Hooks as part of this project
const { useState, useEffect, useContext } = React;
const Tracks = React.createContext();

const Track = ({id=null, name="", duration=0, offset=0, cuts=[], keys=[], slides=[], isRunning=false}) => {
  let {tracks, update} = useContext(Tracks);
  let thisTrack = tracks.find(t => t.id == id);
  //console.log(`Track()`, tracks)

  const [trackname, setName] = useState(name);
  const [start, setStart] = useState(0);
  const [time, setTime] = useState(duration);
  const [running, setRunning] = useState(isRunning);
  // const [tick, setTick] = useState(null); // interval
  
  useEffect(() => {
    let interval = null;
    // console.log('effect')
    if (running) {
      setStart(Date.now());
      interval = setInterval(() => {
        setTime(time => time + (Date.now() - start));
        setStart(Date.now());
      }, 100);
    } else if (!running && time !== 0) {
      clearInterval(interval);
    }
    thisTrack.duration = time;
    return () => clearInterval(interval);
  }, [running, time, start]);

  const startStopRunning = () => {
    if (running) {
      update(tracks);
    }
    setRunning(!running);
  };
  
  const updateName = (n) => {
    setName(n);
    thisTrack.name = n;
    update(tracks);
  };

  const addCut = () => {
    if (running) {
      cuts.push(time);
      update(tracks);
    }
  };

  const addKey = () => {
    if (running) {
      keys.push(time);
      update(tracks);
    }
  };

  const addSlide = () => {
    if (running) {
      slides.push(time);
      update(tracks);
    }
  };
  

  /*const startStopRunning = (run) => {
    if (!running) {
      console.log(`Start`);
      setStart(Date.now());
      //run = setInterval(() => { setTime(time => time + 1); }, 1000);
      run = setInterval(() => { setTime(time => time + (Date.now() - start)); setStart(Date.now()); }, 1000);
    } else {
      console.log(`Stop`);
      clearInterval(run);
    }
    setRunning(!running);
    setTick(run);
  }*/

  const formatTime = (dur) => {
    const milliseconds = parseInt((dur % 1000) / 100);
    const seconds = Math.floor((dur / 1000) % 60);
    const minutes = Math.floor((dur / (1000 * 60)) % 60);
    const hours = Math.floor((dur / (1000 * 60 * 60)) % 24);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${milliseconds}`;
  }


  return (
    <li className={(`track` + ((running)?` running`:``))}>
      <form>
        <header className="header">
          <label className="lbl">
            Track Name
            <input type="text" name="name" value={trackname.trim()} className="name" placeholder="[Click to add]" onChange={({target})=>updateName(target.value)} />
          </label>
          <input type="button" name="start" className="start" value={(!running)?"🔴":"⬛️"} onClick={event=>{startStopRunning()}} />
          <time className="time">{formatTime(time)}</time>
        </header>
        
        <ul className="controls">
          <li><input type="button" name="cut" className="btn cut" value="Cut" onClick={event=>{addCut()}} /></li>
          <li><input type="button" name="keys" className="btn key" value="Key" onClick={event=>{addKey()}} /></li>
          <li><input type="button" name="slide" className="btn slide" value="Slide" onClick={event=>{addSlide()}} /></li>
        </ul>
        {/* <label className="lbl redo">
          <input type="checkbox" name="cutting" className="chck" value="0" />
        </label> */}
      </form>
      <div className="timeline">
        {
          cuts.map((c,i) => <div key={`${i}_${c}`} className="event cut" style={{left:`${c/time*100}%`}} title={formatTime(c)}></div>)
        }
        {
          keys.map((k,i) => <div key={`${i}_${k}`} className="event key" style={{left:`${k/time*100}%`}} title={formatTime(k)}></div>)
        }
        {
          slides.map((s,i) => <div key={`${i}_${s}`} className="event slide" style={{left:`${s/time*100}%`}} title={formatTime(s)}></div>)
        }
      </div>
    </li>
  );
};


const App = () => {
  const [tracks, setTracks] = useState([]);
  var storedTracks = JSON.parse(localStorage.getItem(`tracks`)) || [];
  // console.log(`App()`, tracks)

  useEffect(() => {
    setTracks([
      ...storedTracks,
      ...tracks
    ]);
  }, []);

  const update = t => {
    setTracks(t);
    localStorage.setItem(`tracks`, JSON.stringify(t));
  }

  const newTrack = () => {
    const t = [
      {
        id:Date.now(),
        name:"",
        duration:0,
        offset:0,
        cuts:[],
        keys:[],
        slides:[],
        isRunning:false
      },
      ...tracks
    ];
    update(t);
  }

  return (
    <div>
      <button className="new" onClick={newTrack}>+</button>
      <Tracks.Provider value={{ tracks, update }}>
        {console.log(`App() render`, tracks)}
        <ul className="list">
          {
            tracks.map((t,i) => <Track key={t.id} id={t.id} name={t.name} duration={t.duration} offset={t.offset} cuts={t.cuts} keys={t.keys} slides={t.slides} isRunning={t.isRunning}></Track>)
          }
        </ul>
      </Tracks.Provider>
    </div>
  );
};


ReactDOM.render(<App />, document.getElementById('app'));