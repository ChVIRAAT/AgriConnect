print("Training file is working")
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Dataset location
DATASET_PATH = r"..\dataset\fingerprint-bloodgroup-detection-main\dataset\dataset_blood_group"

# Image settings
IMG_SIZE = (128, 128)
BATCH_SIZE = 32

# Load and prepare images
datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2
)

train_data = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="training",
    shuffle=True
)

validation_data = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    subset="validation",
    shuffle=False
)

# Create CNN model
model = models.Sequential([
    layers.Input(shape=(128, 128, 3)),

    layers.Conv2D(32, (3, 3), activation="relu"),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(64, (3, 3), activation="relu"),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(128, (3, 3), activation="relu"),
    layers.MaxPooling2D((2, 2)),

    layers.Flatten(),

    layers.Dense(128, activation="relu"),
    layers.Dropout(0.5),

    layers.Dense(8, activation="softmax")
])

# Compile model
model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# Display model information
model.summary()

# Train model
history = model.fit(
    train_data,
    validation_data=validation_data,
    epochs=10
)

# Save trained model
model.save("blood_group_model.keras")

print("\nTraining completed successfully!")
print("Model saved as blood_group_model.keras")