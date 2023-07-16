import sharp from 'sharp'
import readlineSync from 'readline-sync'
import fs from 'fs'

const ASCII_CHARS =
  '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. '.split(
    ''
  )
const charLength = ASCII_CHARS.length
const interval = charLength / 256
let newHeight: number | null = null

const main = async (newWidth = 100) => {
  try {
    const filePath = readlineSync.question("What's the file path: ")
    const image = await sharp(filePath)
    const newImgData = await pixelToAscii(
      await resizeImg(await convertToGrayscale(image))
    )
    const pixels = newImgData.length
    let ASCII = ''

    for (let i = 0; i < pixels; i += newWidth) {
      const line = newImgData.slice(i, i + newWidth)
      ASCII += '\n' + Array(line).join('')
    }

    fs.writeFile('./output-ascii.txt', ASCII, () => {
      console.info('done')
    })
  } catch (error) {
    console.error(error)
  }
}

const convertToGrayscale = async (image: sharp.Sharp) => {
  try {
    const bw = await image.gamma().greyscale()
    return bw
  } catch (error) {
    console.error(error)
    throw error
  }
}

const resizeImg = async (bw: sharp.Sharp, newWidth = 100) => {
  try {
    const blackAndWhite = await bw
    const { width, height } = await blackAndWhite.metadata()
    const ratio = width! / height!
    newHeight = parseInt((newWidth * ratio).toString(), 10)
    const resized = await blackAndWhite.resize(newWidth, newHeight, {
      fit: 'outside',
    })

    return resized
  } catch (error) {
    console.error(error)
    throw error
  }
}

const pixelToAscii = async (image: sharp.Sharp) => {
  try {
    const pixels = await image.raw().toBuffer()
    let characters = ''

    pixels.forEach((pixel: number) => {
      characters += ASCII_CHARS[Math.floor(pixel * interval)]
    })

    return characters
  } catch (error) {
    console.error(error)
    throw error
  }
}

main()
