import cv2

# Chargement du modèle d'apprentissage
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# En fonction de votre confuguration changer la valeur 0 en 1 ou 2 ...
video_capture = cv2.VideoCapture(0)

while True:
    # récupération du flux d'images
    ret, frame = video_capture.read()

    # conversion en niveaux de gris et détection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray)

    # dessin d'un rectange autour du ou des visages reconnus
    for (x, y, w, h) in faces:
        cv2.rectangle(
            img=frame,
            pt1=(x, y),
            pt2=(x + w, y + h),
            color=(0, 255, 0),
            thickness=2,
        )

    # Affichage du résultat
    cv2.imshow("Test OpenCV", frame)

    # si la touche "q" est pressée -> arrêt
    if cv2.waitKey(1) == ord("q"):
        break

video_capture.release()
cv2.destroyAllWindows()
