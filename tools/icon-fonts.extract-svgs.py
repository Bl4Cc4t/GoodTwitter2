from opentypesvg.fonts2svg import main as fonts2svg
import os
import re
import requests
import shutil

# this is a helper script to extract & adjust svgs shapes from the twitter icon fonts.

def downloadFile(url: str, outDir: str) -> str:
    filePath = os.path.join(outDir, url.split("/")[-1])

    if os.path.exists(filePath):
        print(f"File {filePath} already exists, skipping download")

    else:
        response = requests.get(url, stream=True)
        if not response.ok:
            raise Exception(f"[{response.status_code}] Error downloading file with url: {url}")

        with open(filePath, "wb") as file:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    file.write(chunk)

    return filePath


def convertToSvgs(file: str, outDir: str):
    outDir = os.path.join(outDir, f"{file}.svgs")
    os.makedirs(outDir, exist_ok=True)
    fonts2svg(["-av", "-o", outDir, file])
    return outDir


def adjustSvgs(svgDir: str, replacements: list[tuple[str, str]]):
    for svg in os.listdir(svgDir):
        svgPath = os.path.join(svgDir, svg)

        # apply adjustments
        with open(svgPath, "r+") as file:
            content = file.read()
            file.seek(0)

            for (old, new) in replacements:
                content = content.replace(old, new)
            file.write(content)
            file.truncate()

        # rename
        newName = os.path.join(svgDir, svg.replace("uni", ""))
        shutil.move(svgPath, newName)


def adjustSvgTransforms(svgDir: str, transforms: list[tuple[str, str]]):
    for (fileName, transform) in transforms:
        with open(os.path.join(svgDir, fileName), "r+") as file:
            content = file.read()
            file.seek(0)

            if "transform" in content:
                content = re.sub(r"transform=\"[^\"]+\"", f"transform=\"{transform}\"", content)
            else:
                content = content.replace("d=", f"transform=\"{transform}\" d=")
            file.write(content)
            file.truncate()



def main():
    outDir = os.path.dirname(os.path.abspath(__file__))
    fonts = [
        {
            "url": "https://abs.twimg.com/a/1496201771/font/rosetta-icons-Regular.woff",
            "replacements": [
                (' fill="#000000"', ""),
                ('viewBox="-4 -1964 2612 6692"', 'viewBox="0 -1920 2048 2048"')
            ],
            "fileTransforms": [
                ("E609.svg", "translate(0 42)"),
                ("F004.svg", "translate(0 15)"),
                ("F025.svg", "translate(70 40)"),
                ("F027.svg", "translate(0 42)"),
                ("F028.svg", "translate(0 42)"),
                ("F029.svg", "translate(140 45)"),
                ("F030.svg", "translate(35 40)"),
                ("F031.svg", "translate(450 40)"),
                ("F032.svg", "translate(0 42)"),
                ("F033.svg", "translate(0 42)"),
                ("F034.svg", "translate(212 42)"),
                ("F035.svg", "translate(0 42)"),
                ("F036.svg", "translate(0 40)"),
                ("F037.svg", "translate(120 40)"),
                ("F038.svg", "translate(325 29)"),
                ("F040.svg", "translate(0 42)"),
                ("F042.svg", "translate(0 40)"),
                ("F043.svg", "translate(0 40)"),
                ("F044.svg", "translate(0 40)"),
                ("F045.svg", "translate(252 48)"),
                ("F046.svg", "translate(152 42)"),
                ("F047.svg", "translate(0 42)"),
                ("F048.svg", "translate(165 40)"),
                ("F050.svg", "translate(34.5 40)"),
                ("F051.svg", "translate(100 40)"),
                ("F052.svg", "translate(90 35)"),
                ("F053.svg", "translate(5 100)"),
                ("F054.svg", "translate(37 23)"),
                ("F055.svg", "translate(120 40)"),
                ("F056.svg", "translate(80 30)"),
                ("F058.svg", "translate(52 40)"),
                ("F059.svg", "translate(56 72)"),
                ("F065.svg", "translate(260 42)"),
                ("F085.svg", "translate(432 45)"),
                ("F087.svg", "translate(28 0)"),
                ("F088.svg", "translate(55 0)"),
                ("F089.svg", "translate(65 44)"),
                ("F090.svg", "translate(130 0)"),
                ("F091.svg", "translate(400 45)"),
                ("F092.svg", "translate(259 42)"),
                ("F093.svg", "translate(227 30)"),
                ("F094.svg", "translate(0 50)"),
                ("F095.svg", "translate(150 40)"),
                ("F096.svg", "translate(338 40)"),
                ("F097.svg", "scale(0.95 0.95) translate(45 0)"),
                ("F098.svg", "translate(265 35)"),
                ("F099.svg", "translate(27 46)"),
                ("F101.svg", "translate(230 32)"),
                ("F102.svg", "translate(240 30)"),
                ("F103.svg", "translate(0 40)"),
                ("F104.svg", "translate(0 40)"),
                ("F109.svg", "translate(0 40)"),
                ("F110.svg", "translate(0 38)"),
                ("F111.svg", "translate(0 38)"),
                ("F112.svg", "translate(285 30)"),
                ("F114.svg", "translate(32 8)"),
                ("F124.svg", "scale(0.75 0.75) translate(60 -265)"),
                ("F138.svg", "translate(22 127)"),
                ("F147.svg", "translate(102 110)"),
                ("F148.svg", "translate(142 0)"),
                ("F149.svg", "translate(785 0)"),
                ("F150.svg", "scale(0.8 0.8) translate(68 -220)"),
                ("F151.svg", "translate(0 75)"),
                ("F152.svg", "scale(0.8 0.8) translate(0 -285)"),
                ("F154.svg", "translate(285 105)"),
                ("F156.svg", "translate(385 0)"),
                ("F157.svg", "translate(256 0)"),
                ("F158.svg", "translate(128 0)"),
                ("F159.svg", "translate(160 -35)"),
                ("F160.svg", "translate(620 0)"),
                ("F161.svg", "translate(256 0)"),
                ("F162.svg", "translate(512 0)"),
                ("F163.svg", "translate(540 0)"),
                ("F164.svg", "translate(553 0)"),
                ("F170.svg", "translate(0 42)"),
                ("F172.svg", "translate(435 34)"),
                ("F173.svg", "translate(435 34)"),
                ("F174.svg", "translate(320 -47)"),
                ("F177.svg", "translate(0 44)"),
                ("F178.svg", "scale(0.8, 0.8) translate(150 -185)"),
                ("F179.svg", "translate(25 42)"),
                ("F180.svg", "translate(0 45)"),
                ("F181.svg", "translate(0 45)"),
                ("F182.svg", "translate(0 41)"),
                ("F183.svg", "translate(71 47)"),
                ("F184.svg", "translate(71 15)"),
                ("F185.svg", "translate(67 15)"),
                ("F187.svg", "translate(64 0)"),
                ("F188.svg", "translate(320 -65)"),
                ("F189.svg", "translate(193 -65)"),
                ("F190.svg", "translate(195 -42)"),
                ("F193.svg", "translate(460 34)"),
                ("F194.svg", "translate(460 34)"),
                ("F195.svg", "translate(70 40)"),
                ("F196.svg", "translate(70 40)"),
                ("F197.svg", "translate(172 30)"),
                ("F198.svg", "translate(172 40)"),
                ("F199.svg", "translate(135 35)"),
                ("F200.svg", "translate(285 143)"),
                ("F201.svg", "scale(0.8, 0.8) translate(105 -190)"),
                ("F202.svg", "scale(0.8, 0.8) translate(105 -190)"),
                ("F203.svg", "translate(65 -20)"),
                ("F204.svg", "translate(0 -15)"),
                ("F206.svg", "translate(50 0)"),
                ("F207.svg", "translate(52 0)"),
                ("F300.svg", "translate(0 42)"),
                ("F310.svg", "translate(350 0)"),
                ("F311.svg", "translate(400 -5)"),
                ("F312.svg", "scale(0.8, 0.8) translate(51 -220)"),
                ("F320.svg", "translate(345 -5)"),
                ("F331.svg", "translate(133 25)"),
                ("F336.svg", "translate(-25 -25)"),
                ("F400.svg", "translate(70 0)"),
                ("F401.svg", "translate(75 -25)"),
                ("F402.svg", "translate(75 -25)"),
                ("F403.svg", "translate(50 -25)"),
                ("F404.svg", "translate(0 -35)"),
                ("F405.svg", "translate(85 -25)"),
                ("F406.svg", "translate(85 -25)"),
                ("F407.svg", "translate(120 -25)"),
                ("F408.svg", "scale(0.8, 0.8) translate(40 -250)"),
            ]
        },
        {
            "url": "https://abs.twimg.com/a/1569889127/font/edge-icons-Regular.woff",
            "replacements": [
                ('fill="#000000"', 'transform="translate(0 -37)"')
            ],
            "fileTransforms": [
                ("F066.svg", "translate(0 25)"),
                ("F101.svg", "translate(30 -37)"),
                ("F155.svg", "translate(0 -100)"),
                ("F162.svg", "translate(-80 0)"),
                ("F567.svg", "translate(0 25)"),
            ]
        }
    ]

    for font in fonts:
        print(f"Downloading file {font['url']}")
        woffFile = downloadFile(font["url"], outDir)
        print(f"Converting to svgs...")
        svgsPath = convertToSvgs(woffFile, outDir)
        print(f"Adjusting svgs...")
        adjustSvgs(svgsPath, font["replacements"])
        adjustSvgTransforms(svgsPath, font["fileTransforms"])

if __name__ == "__main__":
    main()
