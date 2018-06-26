import template from './template.html';
import './style.styl';

export default {
  name: 'HelloWorld',
  template,
  props: {
    msg: String,
  },
};
