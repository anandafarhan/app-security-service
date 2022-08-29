const tf = require('@tensorflow/tfjs-node');
const { defaultResponse } = require('../common/responses');

const modelOptions = {
  modelPath: 'file://src/model/anti-spoofing.json',
  outputTensors: ['activation_4'],
};

const loadModel = async () => {
  // init tensorflow
  await tf.enableProdMode();
  await tf.setBackend('tensorflow');
  await tf.ready();

  // load model
  const model = await tf.loadGraphModel(modelOptions.modelPath);
  console.log('Loaded model', modelOptions, 'tensors:', tf.engine().memory().numTensors, 'bytes:', tf.engine().memory().numBytes);

  // load image and get approprite tensor for it
  const inputSize = Object.values(model.modelSignature.inputs)[0].tensorShape.dim[2].size;

  return { model, inputSize };
};

const loadImage = async (image, inputSize) => {
  const uint8arr = new Uint8Array(image.buffer);

  const obj = tf.tidy(() => {
    const buffer = tf.node.decodeImage(uint8arr);
    const resize = tf.image.resizeBilinear(buffer, [inputSize, inputSize]);
    const normalize = tf.div(resize, 255); // normalize input to range 0..1
    const expand = tf.expandDims(normalize, 0);
    const tensor = expand;
    const img = {
      tensor,
      inputShape: [buffer.shape[1], buffer.shape[0]],
      outputShape: tensor.shape,
      size: buffer.size,
    };
    console.log('Loaded image:', image.originalname, 'inputShape:', img.inputShape, 'outputShape:', img.outputShape);
    return img;
  });
  return obj;
};

//* ------------------------------  Facial Scoring  ----------------------------------- *//

exports.facialScore = async (req, res) => {
  try {
    const { file } = req;

    if (!file) return defaultResponse(res, { status: `error file type of ${typeof file}` }, 400);

    const { model, inputSize } = await loadModel();
    const tObj = await loadImage(file, inputSize);

    const pred = model.execute(tObj.tensor, modelOptions.outputTensors);
    const real = await pred.data();

    const data = {
      raw_score: real[0],
      score_percentage: Math.floor(real[0] * 100),
    };

    return defaultResponse(res, data, 200);
  } catch (err) {
    return defaultResponse(res, err?.response, 500);
  }
};
