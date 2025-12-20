# backend/model/train.py
import os
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from sklearn.utils import class_weight
import numpy as np
from preprocess import get_splits

DATA_DIR = os.path.join(os.path.dirname(__file__), "dataset")
MODEL_SAVE = os.path.join(os.path.dirname(__file__), "cnn_model.h5")

def build_model(input_shape, n_classes):
    model = models.Sequential([
        layers.Conv2D(32, (3,3), activation='relu', input_shape=input_shape),
        layers.MaxPooling2D(2,2),
        layers.Conv2D(64, (3,3), activation='relu'),
        layers.MaxPooling2D(2,2),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(n_classes, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

def run_training(epochs=20, batch_size=32):
    X_train, X_val, X_test, y_train, y_val, y_test, classes = get_splits(DATA_DIR)
    print(f"Classes: {classes}")
    input_shape = X_train.shape[1:]
    n_classes = len(classes)

    cw = class_weight.compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
    class_weights = {i: cw[i] for i in range(len(cw))}

    datagen = tf.keras.preprocessing.image.ImageDataGenerator(
        rotation_range=15,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True
    )
    datagen.fit(X_train)

    model = build_model(input_shape, n_classes)
    es = callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
    mc = callbacks.ModelCheckpoint(MODEL_SAVE, monitor='val_accuracy', save_best_only=True)

    model.fit(datagen.flow(X_train, y_train, batch_size=batch_size),
              epochs=epochs,
              validation_data=(X_val, y_val),
              class_weight=class_weights,
              callbacks=[es, mc])

    loss, acc = model.evaluate(X_test, y_test)
    print(f"Test Accuracy: {acc:.3f}")
    model.save(MODEL_SAVE)

if __name__ == "__main__":
    run_training()
