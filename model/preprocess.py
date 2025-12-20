# backend/model/preprocess.py
import os
import numpy as np
from PIL import Image
from sklearn.model_selection import train_test_split

def load_images(dataset_dir, target_size=(128,128)):
    classes = sorted([d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))])
    X, y = [], []
    for idx, cls in enumerate(classes):
        cls_path = os.path.join(dataset_dir, cls)
        for file in os.listdir(cls_path):
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                img_path = os.path.join(cls_path, file)
                try:
                    img = Image.open(img_path).convert("RGB").resize(target_size)
                    X.append(np.array(img) / 255.0)
                    y.append(idx)
                except:
                    pass
    return np.array(X), np.array(y), classes

def get_splits(dataset_dir, test_size=0.15, val_size=0.15, target_size=(128,128)):
    X, y, classes = load_images(dataset_dir, target_size)
    X_train, X_tmp, y_train, y_tmp = train_test_split(X, y, test_size=(test_size+val_size), stratify=y, random_state=42)
    val_rel = val_size / (test_size + val_size)
    X_val, X_test, y_val, y_test = train_test_split(X_tmp, y_tmp, test_size=val_rel, stratify=y_tmp, random_state=42)
    return X_train, X_val, X_test, y_train, y_val, y_test, classes
