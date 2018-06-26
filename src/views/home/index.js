// @ is an alias to /src
import HelloWorld from '@/components/hello_world';
import template from './template.html';

export default {
  name: 'home',
  template,
  components: {
    HelloWorld,
  },
};
