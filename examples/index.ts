import {Application} from '../src/index';
import { TestSampleController } from './controllers/sample';
import { ControllerListController } from './controllers/controllerList';

var app = new Application();
app.register(TestSampleController);
app.register(ControllerListController);

app.start();

console.log('hello docs!');