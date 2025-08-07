"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Download, Copy, Sparkles, Zap, Heart, Star, ImageIcon, Settings, Code } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const CHARACTER_SETS = {
  standard: "@%#*+=-:. ",
  dense: "█▉▊▋▌▍▎▏ ",
  simple: "█▓▒░ ",
  blocks: "██▓▒░  ",
  dots: "●◐○◯ ",
  custom: "♥♦♣♠◆◇○●",
}

export default function ImageToASCII() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [asciiOutput, setAsciiOutput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [width, setWidth] = useState([80])
  const [characterSet, setCharacterSet] = useState("standard")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const convertToASCII = useCallback((imageData: ImageData, outputWidth: number, chars: string) => {
    const { data, width: imgWidth, height: imgHeight } = imageData
    const aspectRatio = imgHeight / imgWidth
    const outputHeight = Math.floor(outputWidth * aspectRatio * 0.5)

    let ascii = ""

    for (let y = 0; y < outputHeight; y++) {
      for (let x = 0; x < outputWidth; x++) {
        const srcX = Math.floor((x / outputWidth) * imgWidth)
        const srcY = Math.floor((y / outputHeight) * imgHeight)
        const pixelIndex = (srcY * imgWidth + srcX) * 4

        const r = data[pixelIndex]
        const g = data[pixelIndex + 1]
        const b = data[pixelIndex + 2]
        const brightness = (r + g + b) / 3

        const charIndex = Math.floor((brightness / 255) * (chars.length - 1))
        ascii += chars[chars.length - 1 - charIndex]
      }
      ascii += "\n"
    }

    return ascii
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const processImage = async () => {
    if (!selectedImage || !canvasRef.current) return

    setIsProcessing(true)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext("2d")!

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const ascii = convertToASCII(imageData, width[0], CHARACTER_SETS[characterSet as keyof typeof CHARACTER_SETS])

      setAsciiOutput(ascii)
      setIsProcessing(false)

      toast({
        title: "✨ Conversion Complete!",
        description: "Your ASCII art is ready!",
      })
    }

    img.src = selectedImage
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiOutput)
    toast({
      title: "📋 Copied!",
      description: "ASCII art copied to clipboard!",
    })
  }

  const downloadASCII = () => {
    const blob = new Blob([asciiOutput], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ascii-art.txt"
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "💾 Downloaded!",
      description: "ASCII art saved successfully!",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto pt-12 pb-8 px-4">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
            <Code className="w-6 h-6 text-cyan-400" />
            <span className="text-white/80 font-medium">Developer Joe Dada</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              ASCII CONVERTER
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent w-24"></div>
              <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
              <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent w-24"></div>
            </div>
            <p className="text-xl text-white/70 font-light max-w-2xl mx-auto">
              Transform your images into stunning ASCII art with professional-grade conversion tools
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                Image Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Upload Area */}
              <div
                className="group relative border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-purple-400/50 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white/5 to-white/10 hover:from-purple-500/10 hover:to-pink-500/10"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={selectedImage || "/placeholder.svg"}
                        alt="Selected"
                        className="max-w-full max-h-64 mx-auto rounded-xl shadow-2xl border border-white/20"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-green-400 font-semibold">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Image Ready for Conversion
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-bounce"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-white">Drop your image here</p>
                      <p className="text-white/60">or click to browse files</p>
                      <p className="text-sm text-white/40">Supports JPG, PNG, GIF</p>
                    </div>
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

              {/* Controls */}
              <div className="space-y-6 bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Conversion Settings
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-white/80">ASCII Width</label>
                      <span className="text-sm font-bold text-purple-400 bg-purple-400/20 px-2 py-1 rounded-lg">
                        {width[0]} chars
                      </span>
                    </div>
                    <Slider value={width} onValueChange={setWidth} max={120} min={40} step={10} className="w-full" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">Character Style</label>
                    <Select value={characterSet} onValueChange={setCharacterSet}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        <SelectItem value="standard">Standard (@%#*+=-:.)</SelectItem>
                        <SelectItem value="dense">Dense Blocks (█▉▊▋▌▍▎▏)</SelectItem>
                        <SelectItem value="simple">Simple (█▓▒░)</SelectItem>
                        <SelectItem value="blocks">Block Style (██▓▒░)</SelectItem>
                        <SelectItem value="dots">Dots (●◐○◯)</SelectItem>
                        <SelectItem value="custom">Symbols (♥♦♣♠)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                onClick={processImage}
                disabled={!selectedImage || isProcessing}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Converting...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6" />
                    Convert to ASCII
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                  <Code className="w-6 h-6 text-white" />
                </div>
                ASCII Output
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {asciiOutput ? (
                <>
                  <div className="flex gap-3">
                    <Button
                      onClick={copyToClipboard}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold h-12 shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={downloadASCII}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold h-12 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="relative">
                    <Textarea
                      value={asciiOutput}
                      readOnly
                      className="font-mono text-xs leading-tight h-96 bg-black/50 text-green-400 border border-white/20 rounded-xl resize-none backdrop-blur-sm shadow-inner"
                      style={{ fontFamily: "Courier New, monospace" }}
                    />
                    <div className="absolute top-3 right-3 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-lg border border-green-500/30">
                      ASCII Art
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-96 border border-white/20 rounded-xl flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <Code className="w-10 h-10 text-white/60" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/60 font-medium">ASCII art will appear here</p>
                      <p className="text-white/40 text-sm">Upload an image to get started</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-white/80 font-medium">Project by Developer Joe Dada</span>
            <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
          <p className="text-white/60 text-sm">
            Professional ASCII art conversion • Perfect for portfolios and creative projects
          </p>
        </div>
      </div>
    </div>
  )
}
