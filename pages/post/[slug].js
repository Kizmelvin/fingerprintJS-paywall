const BlockContent = require("@sanity/block-content-to-react");
import SyntaxHighlighter from "react-syntax-highlighter";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Modal from "react-bootstrap/Modal";
import imageUrlBuilder from "@sanity/image-url";
import styles from "../../styles/Home.module.css";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import {
  updateDoc,
  doc,
  arrayUnion,
  setDoc,
  getDocFromServer,
} from "firebase/firestore";
import { db } from "../../Utils";
import Link from "next/link";

function Post({ title, body, image, slug }) {
  const { isLoading, getData } = useVisitorData({ immediate: true });
  const [modal, setModal] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [visitTimes, setVisitTimes] = useState(0);

  const [imageUrl, setImageUrl] = useState();
  const router = useRouter();

  const visitedTimes = async () => {
    await getData().then(async (visitor) => {
      const visited = {
        visitorId: visitor.visitorId,
        visitedPostId: slug,
      };

      const { visitorId, visitedPostId } = visited;

      const visitorRef = doc(db, "visitors", `${visitorId}`);

      const documentSnap = await getDocFromServer(visitorRef);

      if (documentSnap.exists()) {
        await updateDoc(visitorRef, {
          visitedPosts: arrayUnion(visitedPostId),
        });
        setUpdated(true);
        if (documentSnap.data().visitedPosts.length >= 3) {
          setModal(true);
        }
        setVisitTimes(documentSnap.data().visitedPosts.length);
      } else {
        setDoc(visitorRef, {
          visitedPosts: visitedPostId,
        });
      }
    });
  };

  useEffect(() => {
    visitedTimes();
    const imgBuilder = imageUrlBuilder({
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      dataset: "production",
    });
    setImageUrl(imgBuilder.image(image));
  }, [image, updated, modal]);

  const serializers = {
    types: {
      code: (props) => (
        <div className="my-2">
          <SyntaxHighlighter language={props.node.language}>
            {props.node.code}
          </SyntaxHighlighter>
        </div>
      ),
    },
  };

  return (
    <>
      {visitTimes >= 3 && modal ? (
        <Modal
          centered
          show={modal}
          onHide={() => window.location.href("/")}
          animation={true}
        >
          <Modal.Header>
            <Modal.Title>Subscribe With Us Today!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Oops! Seems you have exceeded your allocated free articles. You can
            get back by subscribing
          </Modal.Body>
          <Modal.Footer>
            <Link role="button" className="btn btn-secondary" href="/">
              Home
            </Link>
            <Link className="btn btn-secondary" href="#">
              Subscribe
            </Link>
          </Modal.Footer>
        </Modal>
      ) : (
        <div className={styles.postItem}>
          <div className={styles.postNav} onClick={() => router.push("/")}>
            &#x2190;
          </div>
          {imageUrl && <img src={imageUrl} alt={title} />}
          <div>
            <h1>
              <strong>{title}</strong>
            </h1>
          </div>

          <div className={styles.postBody}>
            <BlockContent
              blocks={body}
              serializers={serializers}
              imageOptions={{ w: 320, h: 240, fit: "max" }}
              projectId={process.env.NEXT_PUBLIC_PROJECT_ID}
              dataset={"production"}
            />
          </div>
        </div>
      )}
    </>
  );
}
export const getStaticPaths = async (pageContext) => {
  const particularPost = encodeURIComponent(`*[ _type == "post"]`);
  const url = `https://${process.env.NEXT_PUBLIC_PROJECT_ID}.api.sanity.io/v1/data/query/production?query=${particularPost}`;

  const postData = await fetch(url).then((res) => res.json());
  const postItem = postData.result;

  const paths = postItem.map((post) => ({
    params: { slug: post.slug.current },
  }));
  console.log(paths);
  return {
    paths,
    fallback: false,
  };
  //}
};

export const getStaticProps = async ({ params }) => {
  const particularPost = encodeURIComponent(
    `*[ _type == "post" && slug.current == "${params.slug}"]`
  );
  const url = `https://${process.env.NEXT_PUBLIC_PROJECT_ID}.api.sanity.io/v1/data/query/production?query=${particularPost}`;

  const postData = await fetch(url).then((res) => res.json());
  const postItem = postData.result[0];

  return {
    props: {
      title: postItem.title,
      body: postItem.body,
      image: postItem.mainImage,
      slug: postItem.slug.current,
    },
  };
};
export default Post;
