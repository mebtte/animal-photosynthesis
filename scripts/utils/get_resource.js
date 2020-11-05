import event, { EventType } from './event.js';

const RESOURCE_MAP = {};

event.on(EventType.RESOURCE_BUILT, ({ originalPath, newFilename }) => {
  RESOURCE_MAP[originalPath] = newFilename;
});

export default (originalPath) => RESOURCE_MAP[originalPath];
