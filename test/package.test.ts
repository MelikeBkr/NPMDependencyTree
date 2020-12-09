import * as getPort from 'get-port';
import got from 'got';
import { Server } from 'http';
import { createApp } from '../src/app';


describe('/package/:name/:version endpoint', () => {
  let server: Server;
  let port: number;

  beforeAll(async (done) => {
    port = await getPort();
    server = createApp().listen(port, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('Check first level dependencies', async () => {

    const packageVersion = '16.13.0';
    const packageName = 'react';
    const packageDepList = ['loose-envify', 'object-assign', 'prop-types'];
    const res: any = await got(
      `http://localhost:${port}/package/${packageName}/${packageVersion}`,
    ).json();

    for(let i=0; i<3;i++)
    {
      expect(res.dependencies.children[i].name).toEqual(packageDepList[i]);
    }

  });

  it('Check all level dependencies', async () => {

    const packageVersion = '0.17.1';
    const packageName = 'send';
    const packageDepList = 
      {"name":"send","children":[
      {"name":"debug","children":[{"name":"ms","children":[]}]},
      {"name":"depd","children":[]},
      {"name":"destroy","children":[]},
      {"name":"encodeurl","children":[]},
      {"name":"escape-html","children":[]},
      {"name":"etag","children":[]},
      {"name":"fresh","children":[]},
      {"name":"http-errors","children":[]},
      {"name":"mime","children":[]},
      {"name":"ms","children":[]},
      {"name":"on-finished","children":[]},
      {"name":"range-parser","children":[]},
      {"name":"statuses","children":[]}]};

    const res: any = await got(
      `http://localhost:${port}/package/${packageName}/${packageVersion}`,
    ).json();
    
    expect(res.dependencies).toMatchObject(packageDepList);
    //expect('{"day":14,"month":3}').toMatchJSON({month: 12})
  
  });

});