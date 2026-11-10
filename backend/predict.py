import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model

# Blood group classes
class_names = [
    "A+",
    "A-",
    "AB+",
    "AB-",
    "B+",
    "B-",
    "O+",
    "O-"
]

# Load trained model
model = load_model("blood_group_model.keras")


def predict_blood_group(image_path):

    # Load fingerprint image
    img = image.load_img(
        image_path,
        target_size=(128, 128)
    )

    # Convert image to array
    img_array = image.img_to_array(img)

    # Normalize pixel values
    img_array = img_array / 255.0

    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)

    # Make prediction
    predictions = model.predict(img_array, verbose=0)

    # Get highest probability
    predicted_index = np.argmax(predictions[0])

    confidence = float(
        predictions[0][predicted_index] * 100
    )

    # Get blood group
    blood_group = class_names[predicted_index]

    return blood_group, confidence