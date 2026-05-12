let axios = require('axios')
  let BodyForm = require('form-data')
  let { fromBuffer } = require('file-type')
  let fetch = require('node-fetch')
  let fs = require('fs')
  let path = require('path')
  let os = require('os')

  function TelegraPh (Path) {
          return new Promise (async (resolve, reject) => {
                  if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
                  try {
                          const form = new BodyForm();
                          form.append("file", fs.createReadStream(Path))
                          const data = await  axios({
                                  url: "https://telegra.ph/upload",
                                  method: "POST",
                                  headers: {
                                          ...form.getHeaders()
                                  },
                                  data: form
                          })
                          return resolve("https://telegra.ph" + data.data[0].src)
                  } catch (err) {
                          return reject(new Error(String(err)))
                  }
          })
  }

  async function UploadFileUgu (input) {
          return new Promise (async (resolve, reject) => {
                          const form = new BodyForm();
                          form.append("files[]", fs.createReadStream(input))
                          await axios({
                                  url: "https://uguu.se/upload.php",
                                  method: "POST",
                                  headers: {
                                          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
                                          ...form.getHeaders()
                                  },
                                  data: form
                          }).then((data) => {
                                  resolve(data.data.files[0])
                          }).catch((err) => reject(err))
          })
  }

  // Local WebP to MP4 conversion using fluent-ffmpeg + ffmpeg-static
  // No external API needed — works offline and reliably
  function webp2mp4File(inputPath) {
          return new Promise((resolve, reject) => {
                  try {
                          const ffmpeg = require('fluent-ffmpeg')
                          const ffmpegPath = require('ffmpeg-static')
                          ffmpeg.setFfmpegPath(ffmpegPath)

                          const outputPath = path.join(os.tmpdir(), 'webp2mp4_' + Date.now() + '.mp4')

                          ffmpeg(inputPath)
                                  .outputOptions([
                                          '-movflags', 'faststart',
                                          '-pix_fmt', 'yuv420p',
                                          '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'
                                  ])
                                  .toFormat('mp4')
                                  .on('end', () => {
                                          resolve({
                                                  status: true,
                                                  message: 'Converted locally via ffmpeg',
                                                  result: outputPath,
                                                  isLocal: true
                                          })
                                  })
                                  .on('error', (err) => {
                                          reject(new Error('ffmpeg conversion failed: ' + err.message))
                                  })
                                  .save(outputPath)
                  } catch (err) {
                          reject(new Error('webp2mp4File setup error: ' + err.message))
                  }
          })
  }

  async function floNime(medianya, options = {}) {
  const { ext } = await fromBuffer(medianya) || options.ext
          var form = new BodyForm()
          form.append('file', medianya, 'tmp.'+ext)
          let jsonnya = await fetch('https://flonime.my.id/upload', {
                  method: 'POST',
                  body: form
          })
          .then((response) => response.json())
          return jsonnya
  }

  module.exports = { TelegraPh, UploadFileUgu, webp2mp4File, floNime }
  