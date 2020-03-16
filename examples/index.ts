import {Application} from '../src/index';
import { TestSampleController } from './controllers/sample';
import { ControllerListController } from './controllers/controllerList';
import { ModalController } from './controllers/modal';
import { PopoverController } from './controllers/popover';

var app = new Application();
app.register(TestSampleController);
app.register(ControllerListController);
app.register(ModalController);
app.register(PopoverController);

app.start();

//TODO expose better
// @ts-ignore;
window.helpers = app.helpers;

document.querySelector('.js-disconnect-all').addEventListener('click', (e) => {
    app.destroy();
});

console.log('hello docs!');