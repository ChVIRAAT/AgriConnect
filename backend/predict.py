from pathlib import Path
from threading import Lock

CLASS_NAMES = (
    "A+",
    "A-",
    "AB+",
    "AB-",
    "B+",
    "B-",
    "O+",
    "O-"
)

MODEL_PATH = Path(__file__).resolve().with_name("blood_group_model.keras")
_model = None
_model_lock = Lock()


def predict_blood_group(image_path):
    import numpy as np
    from tensorflow.keras.models import load_model
    from tensorflow.keras.utils import img_to_array, load_img

    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                _model = load_model(MODEL_PATH)

    img = load_img(image_path, target_size=(128, 128), color_mode="rgb")
    img_array = np.expand_dims(img_to_array(img) / 255.0, axis=0)
    predictions = _model.predict(img_array, verbose=0)

    if predictions.ndim != 2 or predictions.shape[0] != 1:
        raise ValueError("The prediction model returned an invalid result.")
    if predictions.shape[1] != len(CLASS_NAMES):
        raise ValueError("The prediction model has an unexpected number of classes.")

    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][predicted_index] * 100)
    return CLASS_NAMES[predicted_index], confidence