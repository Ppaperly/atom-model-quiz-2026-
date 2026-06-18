import test from "node:test";import assert from "node:assert/strict";import {createSubmissionState,getActiveResult,setSubmissionMode} from "../src/submission-editor.js";
test("canvas is the default",()=>assert.equal(createSubmissionState().mode,"canvas"));
test("requires the selected result",()=>{const state=createSubmissionState({canvasDirty:true,canvasData:"canvas"});assert.deepEqual(getActiveResult(state),{submissionType:"canvas",imageData:"canvas"});setSubmissionMode(state,"photo");assert.throws(()=>getActiveResult(state),/사진/);});
