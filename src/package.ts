import { RequestHandler } from 'express';
import got from 'got';
import { NPMPackage } from './types';
const bodyParser = require("body-parser");
const axios = require("axios");
var LRU = require("lru-cache")

var lruCache = new LRU(50);
//var versionPattern = /\d+(\.\d+)+/g;

/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  const { packageName, version } = req.params;

  lruCache.reset();

 try 
 {
    const dependencies = await listDependencies({ packageName, version });
    return res.status(200).json({ dependencies});
  } 
  catch (error) 
  {
    return next(error);
  }
};

const getDependencies = async (packageName: any, version: any)=>{
  /*var pattern = /\d+(\.\d+)+/g;
  version = pattern.exec(version);
  version = version[0];
  */
  const rootPackageName = lruCache.get(packageName);
  
  if (rootPackageName) 
  {
      return rootPackageName;
  }
  try 
  {
    const npmPackage: NPMPackage = await got(
      `https://registry.npmjs.org/${packageName}`,
    ).json();
    console.log("name: "+ packageName);
    const packDependencies = npmPackage.versions[version].dependencies;
    lruCache.set(packageName, packDependencies);
    return packDependencies;
  } 
  catch (error) 
  {
    console.log("The dependencies could not be fetched. Check the package name:", error);
    return {};
  }
};
const listDependencies = async (object: { packageName: any; version: any; }) => {
  const  dependencies  = await getDependencies(
    object.packageName,
    object.version
  );
  if (!dependencies || Object.keys(dependencies).length === 0) {
    return { name: object.packageName, children: [] };

  }

  const dependencyList = await Promise.all(
    Object.entries(dependencies).map(([packageName, version]) =>
       listDependencies({ packageName, version})
    )
  );
  return { name: object.packageName, children: dependencyList };
};

