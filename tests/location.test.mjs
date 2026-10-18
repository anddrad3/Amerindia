import test from 'node:test';
import assert from 'node:assert/strict';
import {getDevicePosition,locationFailureMessage} from '../public/assets/js/map/location.js';
test('location requests bounded, approximate coordinates only when explicitly invoked',async()=>{
  let calls=0;
  const mock={getCurrentPosition(success,failure,options){calls++;assert.equal(options.enableHighAccuracy,false);assert.equal(options.timeout,12000);success({coords:{longitude:-60,latitude:-3,accuracy:50}});}};
  assert.equal(calls,0);
  assert.equal((await getDevicePosition(mock)).coords.latitude,-3);
  assert.equal(calls,1);
});
test('permission denial and timeout are recoverable and clearly identified',async()=>{
  for(const code of [1,2,3]){
    await assert.rejects(getDevicePosition({getCurrentPosition(ok,fail){fail({code});}}),error=>error.code===code);
    assert.ok(locationFailureMessage({code}).length>20);
  }
});
test('unsupported devices reject without requesting data',async()=>{
  await assert.rejects(getDevicePosition(null),/não oferece localização/);
});
