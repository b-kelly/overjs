import {Application} from '../src/index';
import { SampleController } from './controllers/sample';

var app = new Application();
app.register(SampleController);

app.start();

console.log('hello docs!');