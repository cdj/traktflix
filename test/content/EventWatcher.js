import sinon from 'sinon';
import EventWatcher from '../../src/class/content/EventWatcher';
import NetflixTestUtils from '../../test-helpers/NetflixTestHelper';

const onPlay = sinon.spy();
const onStop = sinon.spy();
const events = new EventWatcher({onPlay, onStop});

events.startListeners();

describe(`EventWatcher`, () => {
  beforeEach(() => {
    document.body.innerHTML = ``;
    onPlay.resetHistory();
    onStop.resetHistory();
  });

  it(`onStop() and onPlay() are called when the url changes from a show to another`, () => {
    NetflixTestUtils.renderPlayer(`show`);
    events.onUrlChange(`/watch/1`, `/watch/2`);
    expect(onPlay.callCount).to.equal(1);
    expect(onStop.callCount).to.equal(1);
  });

  it(`onStop() is called when the url changes from a show to a regular page`, () => {
    NetflixTestUtils.renderPlayer(`show`);
    events.onUrlChange(`/watch/1`, `/browse`);
    expect(onPlay.callCount).to.equal(0);
    expect(onStop.callCount).to.equal(1);
  });

  it(`onPlay() is called when the url changes from a regular page to a show`, () => {
    NetflixTestUtils.renderPlayer(`show`);
    events.onUrlChange(`/browse`, `/watch/1`);
    expect(onPlay.callCount).to.equal(1);
    expect(onStop.callCount).to.equal(0);
  });

  it(`nothing happens when the url changes from a regular page to another`, () => {
    NetflixTestUtils.renderPlayer(`show`);
    events.onUrlChange(`/browse`, `/title/12345678`);
    expect(onPlay.callCount).to.equal(0);
    expect(onStop.callCount).to.equal(0);
  });

  it(`onBeforeUnload() stops listeners when the user leaves the page`, () => {
    sinon.stub(events, `stopListeners`);
    events.onBeforeUnload();
    expect(onStop.callCount).to.equal(1);
    expect(events.stopListeners.callCount).to.equal(1);
    events.stopListeners.restore();
  });

  it(`addUrlChangeListener() listens for url changes every 500ms and detects a change`, done => {
    events.stopListeners();
    events.url = `/browse`;
    sinon.stub(events, `getLocation`).returns(`/watch/1`);
    sinon.stub(events, `onUrlChange`);
    sinon.spy(events, `addUrlChangeListener`);
    events.startListeners();
    setTimeout(() => {
      expect(events.onUrlChange.callCount).to.equal(1);
      expect(events.onUrlChange.args[0]).to.deep.equal([`/browse`, `/watch/1`]);
      expect(events.url).to.equal(`/watch/1`);
      expect(events.addUrlChangeListener.callCount).to.equal(2);
      events.getLocation.restore();
      events.onUrlChange.restore();
      events.addUrlChangeListener.restore();
      done();
    }, 500);
  });

  it(`addUrlChangeListener() listens for url changes every 500ms and does not detect a change`, done => {
    events.stopListeners();
    events.url = `/browse`;
    sinon.stub(events, `getLocation`).returns(`/browse`);
    sinon.stub(events, `onUrlChange`);
    sinon.spy(events, `addUrlChangeListener`);
    events.startListeners();
    setTimeout(() => {
      expect(events.onUrlChange.callCount).to.equal(0);
      expect(events.url).to.equal(`/browse`);
      expect(events.addUrlChangeListener.callCount).to.equal(2);
      events.getLocation.restore();
      events.onUrlChange.restore();
      events.addUrlChangeListener.restore();
      done();
    }, 500);
  });
});

events.stopListeners();
