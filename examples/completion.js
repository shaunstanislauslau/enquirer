const Store = require('data-store');
const Input = require('../lib/prompts/input');
const completer = require('./completer');

class Text extends Input {
  constructor(options) {
    super(options);

    let history = this.options.history;
    if (history && history.store) {
      let initial = history.values || this.initial;
      this.autosave = !!history.autosave;
      this.store = history.store;
      this.data = this.store.get('values') || { past: [], present: initial };
      this.initial = this.data.present || this.data.past[this.data.past.length - 1];
    }
  }

  completion(action) {
    if (!this.store) return this.alert();
    this.data = completer(action, this.data, this.input);
    if (!this.data.present) return this.alert();
    this.input = this.data.present;
    this.cursor = this.input.length;
    return this.render();
  }

  altUp() {
    return this.completion('prev');
  }

  altDown() {
    return this.completion('next');
  }

  prev() {
    this.save();
    return super.prev();
  }

  save() {
    if (!this.store) return;
    this.data = completer('save', this.data, this.input);
    this.store.set('values', this.data);
  }

  submit() {
    let value = super.submit();
    if (this.store && this.autosave === true) this.save();
    return value;
  }
}

const prompt = new Text({
  name: 'username',
  message: 'GitHub username?',
  initial: 'jonschlinkert',
  history: {
    store: new Store({ path: `${__dirname}/username.json` }),
    autosave: true
  }
});

prompt.run()
  .then(answer => console.log('Answer:', answer))
  .catch(console.error);
