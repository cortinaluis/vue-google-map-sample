import template from './template.html';
import './style.styl';

export default {
  name: 'hello-world',
  template,
  props: {
    msg: String,
  },
};
