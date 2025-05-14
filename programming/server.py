import random
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from collections import Counter
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64
from flask import make_response

app = Flask(__name__)
CORS(app)

def quantize_color(rgb, step=32):
    r, g, b = rgb
    return (
        (r // step) * step,
        (g // step) * step,
        (b // step) * step
    )

def detect_colors(img, step=32, top_n=10):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (100, 100))
    pixels = img.reshape(-1, 3)
    quantized_pixels = [quantize_color(tuple(p), step) for p in pixels]
    most_common = Counter(quantized_pixels).most_common(top_n)
    return [color for color, _ in most_common]

def plot_colors(colors):
    num_colors = len(colors)
    plt.figure(figsize=(num_colors, 1.5))
    for i, color in enumerate(colors):
        rgb = np.array(color) / 255
        plt.fill_between([i, i+1], 0, 1, color=rgb)
    plt.xlim(0, num_colors)
    plt.axis('off')
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()
    return buf

@app.route('/grayscale', methods=['POST'])
def grayscale():
    if 'image' not in request.files:
        return {"error": "No image uploaded"}, 400

    file = request.files['image']
    img_bytes = file.read()
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, buffer = cv2.imencode('.png', gray)
    return send_file(
        io.BytesIO(buffer),
        mimetype='image/png',
        as_attachment=False
    )

@app.route('/picker', methods=['POST'])
def picker():
    if 'image' not in request.files:
        return {"error": "No image uploaded"}, 400

    file = request.files['image']
    img_bytes = file.read()
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    raw_colors = detect_colors(img)
    colors = [tuple(int(c) for c in color) for color in raw_colors]
    color_plot = plot_colors(colors)

    encoded_img = base64.b64encode(color_plot.getvalue()).decode('utf-8')
    
    return jsonify({
        "colors": colors,
        "image": encoded_img
    })
@app.route('/sketch', methods=['POST'])
def sketch():
    if 'image' not in request.files:
        return {"error": "No image uploaded"}, 400

    file = request.files['image']
    img_bytes = file.read()
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    inverted = cv2.bitwise_not(gray)
    blur = cv2.bilateralFilter(inverted, d=9, sigmaColor=75, sigmaSpace=75)
    inverted_blur = cv2.bitwise_not(blur)
    sketch = cv2.divide(gray, inverted_blur, scale=256.0)

    _, buffer = cv2.imencode('.png', sketch)
    encoded_img = base64.b64encode(buffer).decode('utf-8')

    return jsonify({
        "image": encoded_img
    })
@app.route('/puzzle', methods=['POST'])
def puzzle():
    if 'image' not in request.files:
        return {"error": "No image uploaded"}, 400

    try:
        file = request.files['image']
        img_bytes = file.read()
        img_array = np.frombuffer(img_bytes, np.uint8)
        original = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if original is None:
            return {"error": "Invalid image file"}, 400

        GRID_SIZE = 3
        TILE_SIZE = 150
        BLANK_INDEX = GRID_SIZE * GRID_SIZE - 1

        original = cv2.resize(original, (GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE))

        # Slice tiles
        tiles = [
            original[row*TILE_SIZE:(row+1)*TILE_SIZE, col*TILE_SIZE:(col+1)*TILE_SIZE].copy()
            for row in range(GRID_SIZE)
            for col in range(GRID_SIZE)
        ]

        # Blank tile at last
        tiles[-1] = np.zeros_like(tiles[-1])

        def shuffled_positions():
            pos = list(range(len(tiles)))
            while True:
                random.shuffle(pos)
                if pos != list(range(len(tiles))):
                    return pos

        positions = shuffled_positions()

        # Encode each tile to base64
        tile_images = []
        for tile in tiles:
            _, buffer = cv2.imencode('.png', tile)
            tile_images.append(base64.b64encode(buffer).decode('utf-8'))

        return jsonify({
            "tiles": tile_images,
            "positions": positions,
            "gridSize": GRID_SIZE,
            "status": "success"
        })
    except Exception as e:
        return {"error": str(e)}, 500
@app.route('/segment', methods=['POST'])
def segment():
    if 'image' not in request.files:
        return {"error": "No image uploaded"}, 400

    file = request.files['image']
    img_bytes = file.read()
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    # K-means color segmentation
    pixel_values = img.reshape((-1, 3))
    pixel_values = np.float32(pixel_values)

    k = 5  # You can dynamically pass 'k' as well, using request args
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    _, labels, centers = cv2.kmeans(pixel_values, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

    # Convert centers to uint8 and get segmented image
    centers = np.uint8(centers)
    segmented_data = centers[labels.flatten()]
    segmented_image = segmented_data.reshape(img.shape)

    # Convert the segmented image to base64 for the frontend
    _, buffer = cv2.imencode('.png', segmented_image)
    encoded_img = base64.b64encode(buffer).decode('utf-8')

    return jsonify({
        "segmentedImage": encoded_img
    })
@app.route("/detect", methods=["POST"])
def hog_detection():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    in_memory_file = file.read()

    # Convert image bytes to numpy array
    npimg = np.frombuffer(in_memory_file, np.uint8)
    image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    if image is None:
        return jsonify({"error": "Invalid image"}), 400

    width = 800
    height = int(image.shape[0] * (800 / image.shape[1]))
    resized_image = cv2.resize(image, (width, height))

    blurred_image = cv2.GaussianBlur(resized_image, (3, 3), 0)
    gray = cv2.cvtColor(blurred_image, cv2.COLOR_BGR2GRAY)

    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
    (rects, weights) = hog.detectMultiScale(gray, winStride=(3, 3), padding=(8, 8), scale=1.05)

    boxes = [[x, y, x + w, y + h] for (x, y, w, h) in rects]
    confidences = [float(w) for w in weights]
    indices = cv2.dnn.NMSBoxes(boxes, confidences, score_threshold=0.6, nms_threshold=0.9)

    for i in indices:
        i = i[0] if isinstance(i, (tuple, list, np.ndarray)) else i
        (x1, y1, x2, y2) = boxes[i]
        cv2.rectangle(resized_image, (x1, y1), (x2, y2), (0, 255, 0), 2)


    _, buffer = cv2.imencode('.png', resized_image)
    img_str = base64.b64encode(buffer).decode('utf-8')

    return jsonify({"image": img_str})
def detect_and_inpaint_cv2(img):
    net = cv2.dnn.readNet("E:\Cv project\project\src\opject detect\yolov3.weights", "E:\Cv project\project\src\opject detect\yolov3.cfg")
    layer_names = net.getLayerNames()
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
    height, width = img.shape[:2]

    blob = cv2.dnn.blobFromImage(img, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
    net.setInput(blob)
    outs = net.forward(output_layers)

    mask = np.zeros((height, width), dtype=np.uint8)
    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > 0.5:
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width * 1.1)
                h = int(detection[3] * height * 1.1)
                x = max(0, int(center_x - w / 2))
                y = max(0, int(center_y - h / 2))
                x2 = min(width, x + w)
                y2 = min(height, y + h)
                cv2.rectangle(mask, (x, y), (x2, y2), 255, -1)

    mask = cv2.GaussianBlur(mask, (15, 15), 0)
    mask = np.where(mask > 50, 255, 0).astype(np.uint8)

    inpainted_telea = cv2.inpaint(img, mask, 5, cv2.INPAINT_TELEA)
    inpainted_ns = cv2.inpaint(img, mask, 5, cv2.INPAINT_NS)
    inpainted_img = cv2.addWeighted(inpainted_telea, 0.5, inpainted_ns, 0.5, 0)
    inpainted_img = cv2.medianBlur(inpainted_img, 3)
    return inpainted_img

def image_to_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    return base64.b64encode(buffer).decode('utf-8')
@app.route('/inpaint', methods=['POST'])
def inpaint_route():
    if 'image' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['image']
    img = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)

    result_img = detect_and_inpaint_cv2(img)
    encoded_img = image_to_base64(result_img)

    return jsonify({'inpaintedImage': encoded_img})
if __name__ == '__main__':
    app.run(debug=True, port=5000)