import tracer from "dd-trace";

if (process.env.LOCAL === 'false') {
  require('http');
  require('https');
  tracer.init();

  const provider = new tracer.TracerProvider();
  provider.register();

}

export default tracer;
